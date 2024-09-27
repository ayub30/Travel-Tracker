import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "",
  port: 5432,
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkCountries() {
  const query = await db.query("SELECT country_code FROM visited_countries");
  let Countries = []
  query.rows.forEach(code => {
    Countries.push(code.country_code)
  });
  return Countries;
}

app.get("/", async (req, res) => {

  const Countries = await checkCountries()
  let Total = Countries.length
  res.render("index.ejs", {
    countries: Countries,
    total: Total
  })
});

app.post("/add", async (req, res) => {
  
  const input = req.body["country"]
  try{
  const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",[input.toLowerCase()])
  const data = result.rows[0]
  const code = data.country_code
  try{
  await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[code])
  res.redirect("/")}
  catch(err){
    console.log(err)
    const Countries = await checkCountries()
    res.render("index.ejs", {
      countries: Countries,
      total: Countries.length,
      error: "Country already visited"
    })
  }
  }
  catch(err){
    console.log(err)
    const Countries = await checkCountries()
    res.render("index.ejs", {
      countries: Countries,
      total: Countries.length,
      error: "Country doesnt exist"
    })
  res.render("index.ejs", {
    countries: Countries,
    total: Countries.length
  })
  }
  
   

  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
