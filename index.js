const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
// const admin = require("firebase-admin");
require('dotenv').config();

// port
const port = process.env.PORT || 5000;

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qi34s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// async function verifyToken(req, res, next) {
//     if (req?.headers?.authorization?.startsWith(`Bearer `)) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;

//         } catch {

//         }
//     }
//     next();
// }


async function run() {
    try {
        await client.connect();
        const database = client.db('bike-house-database');
        const productCollection = database.collection('products');

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // Add NEW Products API
        app.post('/products', async (req, res) => {
            console.log(req.body);
            const result = await productCollection.insertOne(req.body);
            res.send(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Bike House Portal!!')
})

app.listen(port, () => {
    console.log(`Running at ${port}`)
})