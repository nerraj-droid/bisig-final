const { createAdminUser } = require("../src/lib/auth");

async function main() {
    // Create admin user
    await createAdminUser();
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        process.exit(0);
    }); 