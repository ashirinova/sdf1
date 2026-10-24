const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Event Management API Test Scenario', () => {

  test('1. Uğurlu tədbir yaradılması', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'İI Simpoziumu',
      description: 'Süni intellekt haqda',
      category_id: 1,
      event_date: '2026-12-01',
      event_time: '10:00',
      location: 'Akt Zalı',
      max_capacity: 2
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  test('2. Çatışmayan sahə ilə tədbir yaradıldıqda 400 qaytarılmalıdır', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Xətalı Tədbir'
    });
    expect(res.statusCode).toEqual(400);
  });

  test('3. İştirakçı tədbirə uğurla qeydiyyatdan keçməlidir', async () => {
    const res = await request(app).post('/api/registrations').send({
      user_id: 1,
      event_id: 1
    });
    expect(res.statusCode).toEqual(201);
  });

  test('4. Təkrar qeydiyyatın qarşısı alınmalıdır', async () => {
    const res = await request(app).post('/api/registrations').send({
      user_id: 1,
      event_id: 1
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('artıq bu tədbirə qeydiyyatdan keçmisiniz');
  });

  test('5. Tədbir limiti dolduqda yeni qeydiyyat rədd edilməlidir', async () => {
    // İkinci istifadəçi yaradırıq ki, limiti dolduraq (max_capacity: 1 olan tədbir yaradaraq)
    const newEvent = await request(app).post('/api/events').send({
      title: 'Kiçik Qrup Təlimi',
      category_id: 3,
      event_date: '2026-11-10',
      event_time: '14:00',
      location: 'Otaq 101',
      max_capacity: 1
    });

    await request(app).post('/api/registrations').send({ user_id: 1, event_id: newEvent.body.id });

    // Limit dolduqdan sonra daxil olmaq cəhdi
    const overLimitRes = await request(app).post('/api/registrations').send({ user_id: 2, event_id: newEvent.body.id });
    expect(overLimitRes.statusCode).toEqual(400);
    expect(overLimitRes.body.error).toContain('limiti dolub');
  });
});