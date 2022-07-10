//TODO: seeds script should come here, so we'll be able to put some data in our local env

const { faker } = require('@faker-js/faker');
const mongoose = require("mongoose");

async function seedDB() {
	const uri = "mongodb://localhost:27017/admin";
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    console.log("******* Connected correctly to server *******");
	try {
        collectionNames = await db.db.listCollections().toArray();
        for (const collectionName of collectionNames) {
            if (collectionName.name === "users") {
                await db.db.dropCollection("users");
            } else if (collectionName.name === "items") {
                await db.db.dropCollection("items");
            } else if (collectionName.name === "comments") {
                await db.db.dropCollection("comments");
            }
        }
		await seedUsers(db);
        await seedProducts(db);
        await seedComments(db);
        db.close();
	} catch (err) {
		console.log(err.stack);
	}
}

seedDB();
async function seedUsers(db) {
    require("../models/User");
    const User = await db.model("User");
    let usersData = [];
    for (let i = 0; i < 100; i++) {
        const user = new User();
        user.username = `${faker.name.firstName()}${i}`;
        user.email = faker.internet.email();
        user.setPassword(faker.internet.password());
        usersData.push(user);
    }
    await User.insertMany(usersData);
    console.log("******* Database seeded with Users! :) *******");
}

async function seedProducts(db) {
    require("../models/Item");
    require("../models/User");
    const User = await db.model("User");
    const Product = await db.model("Item");
    let productsData = [];
    const users = await User.find();
    for (const i in users) {
        const user = users[i];
        const product = new Product();
        product.slug = `${faker.commerce.productName()}${i}`;
        product.title = `${faker.commerce.productName()}${i}`;
        product.description = `${faker.commerce.productDescription()}${i}`;
        product.image = faker.image.fashion();
        product.favoritesCount = 0;
        product.comments = [];
        product.tagList = [];
        product.seller = user._id;
        productsData.push(product);
    }
    await Product.insertMany(productsData);
    console.log("******* Database seeded with Products! :) *******");
}

async function seedComments(db) {
    require("../models/Comment");
    require("../models/Item");
    require("../models/User");
    const User = await db.model("User");
    const Product = await db.model("Item");
    const Comment = await db.model("Comment");
    let commentsData = [];
    const users = await User.find();
    const products = await Product.find();
    for (const i in users) {
        const user = users[i];
        const product = products[i];
        const comment = new Comment();
        comment.body = `${faker.lorem.sentence()}${i}`;
        comment.seller = user._id;
        comment.item = product._id;
        commentsData.push(comment);
    }
    await Comment.insertMany(commentsData);
    console.log("******* Database seeded with Comments! :) *******");
}
