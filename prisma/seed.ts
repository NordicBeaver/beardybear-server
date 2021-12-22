import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { add } from 'date-fns';
import { hashPassord, sample } from '../src/utils';

function randomDate(start: Date, end: Date) {
  const rangeMs = end.getTime() - start.getTime();
  const resultMs = start.getTime() + Math.random() * rangeMs;
  const result = new Date(resultMs);
  return result;
}

const prisma = new PrismaClient();

async function userInputData(name: string, password: string, role: UserRole) {
  const [passwordHash, passwordSalt] = await hashPassord(password);
  const data: Prisma.UserCreateManyInput = {
    name: name,
    role: role,
    passwordHash: passwordHash,
    passwordSalt: passwordSalt,
  };
  return data;
}

async function seedUsers() {
  const usersData = [
    { name: 'Admin', password: 'qwerty', role: UserRole.ADMIN },
    { name: 'Mike', password: '12345678', role: UserRole.MANAGER },
  ];
  const usersInputData = await Promise.all(
    usersData.map((user) => userInputData(user.name, user.password, user.role)),
  );
  await prisma.user.createMany({ data: usersInputData });
}

async function seedBarbers() {
  const barbersInputData: Prisma.BarberCreateManyInput[] = [
    { name: 'Edward', description: 'I like scissors' },
    { name: 'Boy', description: 'Just a boy' },
  ];
  await prisma.barber.createMany({ data: barbersInputData });
}

async function seedBarberServices() {
  const barberServicesInputData: Prisma.BarberServiceCreateManyInput[] = [
    { name: 'Haircut', description: 'Just a haircut', price: 10 },
    { name: 'Trim', description: "Let's make it shorter", price: 5 },
    { name: 'Trim (ultra)', description: 'Trim but with eyes open', price: 10 },
  ];
  await prisma.barberService.createMany({
    data: barberServicesInputData,
  });
}

async function seedAppointments(
  barberIds: number[],
  barberServiceIds: number[],
) {
  const clientNames = ['John', 'Jack', 'James'];
  const clientPhones = ['111111', '222222', '333333'];
  const dateStart = add(new Date(), { days: -7 });
  const dateEnd = add(new Date(), { days: 7 });
  const appointmentsInputData: Prisma.AppointmentCreateManyInput[] = [];
  for (let i = 0; i < 50; i++) {
    const appointment: Prisma.AppointmentCreateManyInput = {
      barberId: sample(barberIds),
      barberServiceId: sample(barberServiceIds),
      datetime: randomDate(dateStart, dateEnd),
      clientName: sample(clientNames),
      clientPhoneNumber: sample(clientPhones),
    };
    appointmentsInputData.push(appointment);
  }
  await prisma.appointment.createMany({
    data: appointmentsInputData,
  });
}

async function main() {
  await seedUsers();
  await seedBarbers();
  await seedBarberServices();

  const barberIds = (
    await prisma.barber.findMany({ select: { id: true } })
  ).map((b) => b.id);
  const barberServicesIds = (
    await prisma.barberService.findMany({ select: { id: true } })
  ).map((s) => s.id);
  await seedAppointments(barberIds, barberServicesIds);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
