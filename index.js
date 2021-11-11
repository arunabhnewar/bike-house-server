const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
// const admin = require("firebase-admin");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

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
        const purchaseCollection = database.collection('purchases');
        const userCollection = database.collection('users');

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

        // Add Purchase API
        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
        })

        // GET Purchase API
        app.get('/purchases', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const purchase = await cursor.toArray();
            console.log(purchase);
            res.send(purchase);
        })

        // GET EMAIL API
        app.get('/purchases/:email', async (req, res) => {
            const email = req.params.email;
            const result = await purchaseCollection.find({ email }).toArray();
            res.json(result);
        })

        // GET Purchase Confirmation
        app.put('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const manage = {
                $set: {
                    status: 'Confirm'
                }
            }
            const result = await purchaseCollection.updateOne(query, manage)
            res.json(result)
        })

        // Add Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        });


        // GET Admin API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user?.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        // DELETE Purchase API
        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log(result);
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