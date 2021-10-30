const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdj6v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();

        const database = client.db("tourism");
        const servicesCollection = database.collection("services");
        const ordersCollection = database.collection("orders");

        // GET API for services
        app.get("/services", async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.json(services);
        });

        // POST API for services
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        });

        // GET API for each service
        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        });

        // POST API for add order
        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        // PUT API for update order
        app.put("/order/:id", async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json({ result, orders });
        });

        // DELETE API for delete order as a user
        app.delete("/order/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);

            res.json(result);
        });

        // GET API for all orders
        app.get("/orders", async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // GET API for all orders of *user*
        app.get("/orders/:byEmail", async (req, res) => {
            const email = req.params.byEmail;
            const query = { email };
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("server started");
});

app.listen(port, () => {
    console.log(`app listening from backend at http://localhost:${port}`);
});
