import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { User, UserRole } from 'src/domains/users/entities/user.entity';

dotenv.config();

const runSeeder = async () => {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('⏳ Connecting to PostgreSQL...');
    await dataSource.initialize();

    const userRepository = dataSource.getRepository(User);

    const adminEmail = process.env.INITIAL_SA_EMAIL || '';
    const adminPassword = process.env.INITIAL_SA_PASS || '';
    const adminUsername = process.env.INITIAL_SA_USERNAME || '';

    // check if user exist
    const existingAdmin = await userRepository.findOne({
      where: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (!existingAdmin) {
      const hashedPassword = await hash(adminPassword, 12);

      const superAdmin = userRepository.create({
        id: uuidv4(),
        email: adminEmail,
        username: adminUsername,
        fullname: 'Root Super Admin',
        role: UserRole.SUPER_ADMIN,
        password: hashedPassword,
      });

      await userRepository.save(superAdmin);
      console.log('Super Admin created successfully!');
    } else {
      console.log('Super Admin already exists. Skipping...');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await dataSource.destroy();
  }
};

runSeeder();
