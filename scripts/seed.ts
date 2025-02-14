const { createAdminUser, seedHouseholds, seedResidents } = require("../src/lib/auth")

async function main() {
    // Create admin user
    await createAdminUser()

    // Seed households
    await seedHouseholds()

    // Seed residents
    await seedResidents()
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        process.exit(0)
    }) 