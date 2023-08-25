import express from "express";
import pg from "pg";
import "dotenv/config";

const app = express();
app.use(express.json());

const pool = new pg.Pool({
  database: process.env.my_database,
  host: process.env.my_host,
  port: process.env.my_port,
  user: process.env.my_user,
  password: process.env.my_password,
});

async function usersFun(SQL, params) {
  const usersAll = await pool.connect();
  try {
    const { rows } = await usersAll.query(SQL, params);
    return rows;
  } catch (error) {
    console.log(error);
  } finally {
    usersAll.release();
  }
}
usersFun();

app.get("/user", async (req, res) => {
  try {
    const data = await usersFun("select * from userAll");
    return res.send(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/user", async (req, res) => {
  try {
    const { name, age } = req.body;
    const data = await usersFun(
      "insert into userAll(name, age) values ($1,$2)",
      [name, age]
    );
    return res.send(data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  const user1 = await usersFun("select * from userAll");

  const user2 = await usersFun("select * from comment");

  const newUser = user1.find((e) => e.id == id);

  newUser.array = [];

  for (const i of user2) {
    if (newUser.id == i.userall_id) {
      newUser.array.push(i);
    }
  }
  return res.send(newUser);
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  const data = await usersFun("delete from userAll where id = :id ");
  return res.send(data);
});

app.get("/a", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await usersFun(
      "select u.name , json_agg(json_build_object('all', c.info)) from userall as u inner join comment as c on u.id = c.userall_id group by u.name "
    );
    return res.send(data)
  } catch (error) {
    console.log(error);
  }
});
app.listen(5050, console.log("create server 5050"));
