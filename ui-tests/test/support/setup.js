const {
	setDefaultTimeout,
	AfterAll,
	BeforeAll,
	Before,
	After
} = require("cucumber");
const { createSession, closeSession } = require("nightwatch-api");
const { sleep } = require("../../util");

setDefaultTimeout(60000);

BeforeAll(async () => {});

Before(async () => {
	await createSession({ env: "default" });
});

After(async () => {
	await sleep(1000);
	await closeSession();
});

AfterAll(async () => {
	// await sleep(3000);
	// await closeSession();
});
