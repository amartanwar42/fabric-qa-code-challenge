import { faker } from '@faker-js/faker';

const testData = {
	employee: {
		firstName: () => faker.person.firstName(),
		middleName: () => faker.person.middleName(),
		lastName: () => faker.person.lastName(),
		employeeId: () => faker.string.numeric(5),
		username: () => faker.internet.username(),
		password: () => faker.internet.password({ length: 12, prefix: 'A1!' }),
	},

	randomString: (length = 10) => faker.string.alpha(length),
	randomNumber: (min = 1, max = 99999) => faker.number.int({ min, max }),
	randomEmail: () => faker.internet.email(),
	randomPhone: () => faker.phone.number(),
};

export default testData;
