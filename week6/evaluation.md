# Evaluation — Compare Candidate Architectures

## Comparison Table
> Scoring: 1 (แย่) ถึง 5 (ดี)
> Weighted = Weight(%) × (Score/5)

| Criteria | Weight | Arch 1 (Score) | Arch 1 (Weighted) | Arch 2 (Score) | Arch 2 (Weighted) |
|----------|--------|----------------|-------------------|----------------|-------------------|
| Performance | 20% | 4 | 20×(4/5)=16.0 | 4 | 20×(4/5)=16.0 |
| Scalability | 15% | 3 | 15×(3/5)=9.0 | 5 | 15×(5/5)=15.0 |
| Availability | 15% | 3 | 15×(3/5)=9.0 | 4 | 15×(4/5)=12.0 |
| Maintainability (for solo dev) | 15% | 4 | 15×(4/5)=12.0 | 3 | 15×(3/5)=9.0 |
| Security | 15% | 4 | 15×(4/5)=12.0 | 3 | 15×(3/5)=9.0 |
| Cost/Complexity | 10% | 4 | 10×(4/5)=8.0 | 2 | 10×(2/5)=4.0 |
| Time-to-market | 10% | 5 | 10×(5/5)=10.0 | 2 | 10×(2/5)=4.0 |
| **Total** | **100%** |  | **76.0** |  | **69.0** |

## Selected Architecture
**Decision:** Candidate Architecture 1 — Modular Monolith (Layered + REST API)

**Reasons:**
1. เหมาะกับข้อจำกัด “งานเดี่ยว + เวลาจำกัด” ทำให้ส่งงานได้ครบ (requirements, trade-offs, ADR, diagram) โดยไม่จมกับ infra
2. ความสอดคล้องของข้อมูลการจอง (กันจองชนกัน) ทำได้ตรงไปตรงมาด้วยฐานข้อมูลเดียวและ transaction/locking
3. ลดความเสี่ยงด้านการ deploy/debug และค่าใช้จ่ายในการดูแลระบบ (ไม่ต้องมี broker/หลาย services)
4. ยังรองรับการเติบโตระดับหนึ่งได้ผ่านแนว Modular Monolith และแยก module boundary ให้ชัดเจน (เผื่อ refactor เป็น services ในอนาคต)
