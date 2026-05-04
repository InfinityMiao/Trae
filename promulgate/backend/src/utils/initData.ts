import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { Employee } from '../entities/Employee';

export async function initializeSystemData() {
  const employeeRepo = AppDataSource.getRepository(Employee);

  const adminEmployeeNo = process.env.ADMIN_EMPLOYEE_NO || 'admin';
  const adminIdCardLast6 = process.env.ADMIN_ID_CARD_LAST6 || '123456';

  const existingAdmin = await employeeRepo.findOne({
    where: { employee_no: adminEmployeeNo },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminIdCardLast6, 10);
    const admin = employeeRepo.create({
      name: '系统管理员',
      employee_no: adminEmployeeNo,
      id_card_last6: adminIdCardLast6,
      password_hash: passwordHash,
      employee_type: 'admin',
      department_id: null,
      position_id: null,
      status: 'active',
      first_login: 1,
      login_fail_count: 0,
      lock_until: null,
    });
    await employeeRepo.save(admin);
    console.log('Default admin created:', adminEmployeeNo);
  } else {
    console.log('Default admin already exists');
  }
}
