# ADR-001: Choose Modular Monolith Architecture for Meeting Room Booking System

- **Status:** Accepted
- **Date:** 2026-01-11
- **Decision Title:** Adopt Modular Monolith (Layered + REST API) as the initial architecture

## Context
โครงการ “ระบบจองห้องประชุมออนไลน์” ต้องรองรับการดูตารางห้อง, การจองแบบครั้งเดียวและแบบทำซ้ำ (Recurring),
การป้องกันการจองชนกัน และการแจ้งเตือนผ่าน Email/LINE

ข้อจำกัดสำคัญ:
- เป็นงานเดี่ยวและเวลาพัฒนาจำกัด ต้องการสถาปัตยกรรมที่ทำให้ implement ได้เร็วและส่งงานได้ครบ
- ต้องคุมความเสี่ยงของความซับซ้อนในการ deploy และ debug
- ต้องการความถูกต้องด้านข้อมูลการจอง (no double booking) และมี audit log

Quality drivers หลัก:
- Reliability/Consistency (กันจองชนกัน)
- Performance (โหลดตารางเร็ว)
- Maintainability (แยกโมดูลชัด เพิ่มช่องทางแจ้งเตือนได้)
- Security (auth + role-based access)

## Decision
เลือก **Candidate Architecture 1: Modular Monolith (Layered + REST API)** โดยใช้ backend เดียวแยกเป็นโมดูลภายใน
(User/Room/Booking/Notification/Admin) และใช้ฐานข้อมูลเดียว (MySQL)

## Rationale
1. **Time-to-market สูง:** โครงสร้าง monolith ทำให้เริ่มพัฒนาได้เร็ว ลด overhead ของการตั้งค่า infra หลายชิ้น (gateway, broker, multi-service)
2. **Consistency ง่าย:** การกันจองชนกันสามารถทำผ่าน transaction/unique constraints/locking ใน DB เดียวได้ตรงไปตรงมา
3. **Maintainability สำหรับงานเดี่ยว:** แยกเป็น modules ภายในตามโดเมน ลดการปนกันของความรับผิดชอบ และยัง debug ได้ง่ายกว่า distributed system
4. **รองรับการต่อยอด:** หากในอนาคตระบบโต สามารถค่อย ๆ แยก module ที่ชัดเจน (เช่น Notification) ออกเป็น service ได้ (strangler pattern)

## Alternatives Considered
### Alternative A: Microservices + Event-Driven
- แยก User/Room/Booking/Notification เป็นบริการย่อย, มี API Gateway และ Message Broker
- เหมาะสำหรับการ scale และทีมใหญ่ แต่เพิ่มความซับซ้อนมากสำหรับงานเดี่ยว

## Consequences
### Positive Consequences
- พัฒนา/ทดสอบ/Deploy ง่าย (หนึ่ง backend + หนึ่ง DB)
- ลดภาระ ops และค่าใช้จ่าย
- ทำ correctness ของ booking ได้ดี (atomic transaction)

### Negative Consequences
- Scaling เป็นรายส่วนทำได้จำกัด (ต้อง scale ทั้ง backend)
- หากไม่คุม boundary อาจเกิด coupling ระหว่าง modules
- การส่ง notification หากทำ synchronous อาจกระทบ latency (ต้องออกแบบ async/job)

## Risks and Mitigations
1. **Risk:** Notification ส่งช้าหรือทำให้ request ช้า  
   **Mitigation:** ทำ background job/queue (เช่น BullMQ/Redis) และ retry policy
2. **Risk:** โค้ดโตและยุ่ง (god module)  
   **Mitigation:** บังคับโครงสร้างโฟลเดอร์ตาม module, ใช้ interface/service layer, ทำ lint/test
3. **Risk:** Recurring booking ซับซ้อนและชนกันได้  
   **Mitigation:** ออกแบบ recurring เป็น rule + generate instances ล่วงหน้าตาม horizon (เช่น 3 เดือน) และใช้ constraint ตรวจชนทุก instance

## Follow-up Actions
- กำหนด schema และ constraint สำคัญ (เช่น unique index กันชนตาม room_id + time range strategy)
- เพิ่ม audit log table สำหรับการเปลี่ยนแปลง booking
- เพิ่ม job scheduler สำหรับ reminder T-15 นาที และระบบ retry
