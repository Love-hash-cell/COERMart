const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Shop = require("./models/Shop");

dotenv.config();

const shops = [
    {
        name: "Amul",
        type: "food",
        description: "Amul food and dairy products",
    },
    {
        name: "Samosa Hindustani",
        type: "food",
        description: "Fresh samosas and Indian snacks",
    },
    {
        name: "Nescafe",
        type: "food",
        description: "Coffee, beverages and snacks",
    },
    {
        name: "Flavours",
        type: "food",
        description: "Delicious campus food and beverages",
    },
    {
        name: "Hungry",
        type: "food",
        description: "Food and snacks for campus students",
    },
    {
        name: "Multi Activity Center",
        type: "stationery",
        description: "Stationery and academic supplies",
    },
    {
        name: "Yippee",
        type: "food",
        description: "Yippee noodles and snacks",
    },
    {
        name: "Campus Zaiqa",
        type: "food",
        description: "Campus meals and snacks",
    },
    {
        name: "Mini Snack Point",
        type: "food",
        description: "Quick snacks and beverages",
    },
    {
        name: "Friends Juice Bar",
        type: "food",
        description: "Fresh juices and beverages",
    },
];

const seedShops = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        await Shop.deleteMany({});

        const createdShops = await Shop.insertMany(shops);

        console.log(`${createdShops.length} shops added successfully`);

        createdShops.forEach((shop) => {
            console.log(`✓ ${shop.name} (${shop.type})`);
        });

        await mongoose.connection.close();

        console.log("Database connection closed");
    } catch (error) {
        console.error("Error seeding shops:", error.message);
        process.exit(1);
    }
};

seedShops();