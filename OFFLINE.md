# ข้อมูลในมือถือและ backup

แอปเปิด Home และอ่าน AsyncStorage ก่อนติดต่อ API ใช้ได้ตั้งแต่ติดตั้งครั้งแรกโดยมี Yes Or No และ Food ในเครื่อง

- สร้าง/แก้กาชา รายการโปรด และผลสุ่มเขียนลงมือถือก่อนแจ้งสำเร็จ ใช้งานได้ทั้ง Guest และ Offline
- เมื่อออนไลน์และลงชื่อเข้าใช้ กาชาที่ผู้ใช้สร้างหรือแก้ไขจะซิงก์เข้าตาราง `Card` ผ่าน `/api/backup` และปรากฏในหน้าทดสอบ backend หลังรีเฟรช ส่วน Yes Or No / Food เริ่มต้นที่ยังไม่แก้ไขจะไม่สร้างแถวซ้ำบน server
- ID ในมือถือยังเป็น `local-...` ตามเดิม คู่ ID เก็บใน `cardIds` ของ AsyncStorage แยกตามบัญชี โดย backend ใช้ `(createBy, clientId)` เป็น unique key ส่งซ้ำ/เน็ตหลุด/เปิดแอปใหม่จึงไม่สร้าง card ซ้ำ การแก้ card ใช้แถวเดิม
- ข้อมูลเก่าที่มี backup แต่ยังไม่มีคู่ Card ID จะถูกจัดคิวซิงก์โดยอัตโนมัติหลัง deploy backend ใหม่
- ผลสุ่มเกิดในเครื่อง และ backup ผลเดิมโดยไม่เรียก `/pull` ซ้ำ เมื่อซิงก์ backend จะเพิ่มความคืบหน้า Mission จาก ID ประวัติ local เพียงครั้งเดียวต่อรายการ; เหรียญเพิ่มอัตโนมัติเมื่อ Mission สำเร็จที่ server (การเล่น offline จะเพิ่มเมื่อซิงก์สำเร็จ)
- Offline แสดง Guest และปิดความสามารถของบัญชี แต่ไม่ลบ token หรือข้อมูลบัญชีที่เก็บในเครื่อง เมื่อต่อ API ได้อีกจะกลับเป็นบัญชีเดิม
- ล็อกอินจะรวมข้อมูล Guest กับข้อมูลของบัญชีในเครื่อง จากนั้นรวม backup บน server ด้วย id ของแต่ละรายการ ประวัติไม่ถูกเพิ่มซ้ำ กาชาใช้เวลาที่แก้ไขล่าสุด และ backend ใช้ revision ป้องกันการเขียนทับ backup จากอีกเครื่อง
- ข้อมูลแต่ละบัญชีเก็บแยกกัน ออกจากระบบยังเก็บข้อมูลบัญชีนั้นไว้ในมือถือ แต่กลับไปใช้ชุดข้อมูล Guest การเข้าสู่บัญชีอื่นไม่คัดลอกข้อมูลส่วนตัวของบัญชีเดิม
- สำรองข้อมูลตอนเข้าแต่ละหน้า เมื่อกลับเข้าหน้าแอป หลังแก้ข้อมูล และลองใหม่ทุก 30 วินาทีขณะเปิดแอป ไม่มีงาน background เมื่อปิดแอป
- สถานะบน Home ระบุว่าเก็บในมือถือ รอสำรอง สำรองสำเร็จ หรือ API backup ยังไม่พร้อม
- เหรียญ ธีม โปรไฟล์ และรางวัลภารกิจยังใช้ server เมื่อออนไลน์ ไม่ส่งเหรียญหรือรางวัลจากมือถือผ่าน backup

## ต้อง deploy backend ใหม่เพื่อให้ backup ออนไลน์ทำงาน

ไฟล์ backend ใน `C:/coding/SF333/Gacha_Addict_backend` เพิ่ม `GET /api/backup`, `PUT /api/backup` (JWT), Prisma model `UserBackup` และ migrations `20261008020000_local_backup`, `20261008030000_card_sync_ids`

สำหรับ server ที่รัน Node โดยตรง ให้ deploy source แล้วรัน:

```sh
npm run prisma:generate
npm run prisma:deploy
npm start
```

Dockerfile เดิม generate Prisma ตอน build และ migrate ตอน start จึงต้อง rebuild และ restart image ใหม่:

```sh
git pull
docker compose up -d --build
docker compose logs --tail=100 api
```

หากยังไม่ได้ deploy endpoint นี้ แอปยังใช้ข้อมูลในมือถือได้ และแสดงว่า API backup ยังไม่พร้อม แต่ข้อมูลยังไม่ถูกสำรองบน server

Backup เป็น JSON ของกาชา รายการโปรด และประวัติ แยกตามบัญชีในตาราง `user_backup` เขียน/อัปเดต Card เฉพาะแถวที่จับคู่กับ local ID ของเจ้าของบัญชี ส่วนประวัติยังเก็บใน backup และไม่เพิ่ม Result หรือสุ่มซ้ำ โดยรับข้อมูลสูงสุดตาม JSON body limit ของ API (2 MB) รูปที่เก็บเป็น URL ยังต้องมีอินเทอร์เน็ตเพื่อโหลดภาพ; ผลสุ่มและข้อความใช้งานออฟไลน์ได้ การลบแอป/ล้าง app data จะลบ AsyncStorage ด้วย ข้อมูลที่ยังไม่ได้ backup จะไม่สามารถกู้จาก server ได้

## Frame shop และรางวัล Mission
- API ใหม่ `GET /frames`, `POST /frames/:id/purchase`, `PUT /frames/:id/select` เก็บการซื้อใน UserFrame และหักยอด User.coins ใน transaction
- Migration `20261008040000_frame_shop` สร้าง catalog Frame และตาราง SyncedPull กันนับ Mission ซ้ำ
- หลังอัปเดต backend ใช้ `docker compose up -d --build` เพื่อ rebuild image และรัน migration ตอนเริ่ม container
- หน้า Home แสดง Hello! และ ยินดีต้อนรับคุณ [ชื่อผู้ใช้]

- Migration `20261008050000_automatic_mission_rewards` จ่ายรางวัลภารกิจเก่าที่สำเร็จแต่ยังไม่รับเพียงครั้งเดียว; ภารกิจใหม่จ่ายใน transaction เดียวกับการเพิ่ม progress
