import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Movie from "./models/Movie.js";
import Theatre from "./models/Theatre.js";
import Show from "./models/Show.js";

const times = ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM"];
function indiaDate(offsetDays = 0) {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function ensureDemoData() {
  let movies = await Movie.find().sort({ createdAt: 1 });
  if (!movies.length) {
    const filename = fileURLToPath(new URL("./data/movies.json", import.meta.url));
    const records = JSON.parse(await readFile(filename, "utf8"));
    movies = await Movie.insertMany(records);
    console.log(`Created ${movies.length} sample movies.`);
  }

  let theatres = await Theatre.find({ active: true }).sort({ createdAt: 1 });
  if (!theatres.length) {
    theatres = await Theatre.insertMany([
      { name: "CineStar Central", city: "Bhopal", address: "MP Nagar, Bhopal", screens: 3, facilities: ["Parking", "Food Court", "Dolby Audio"] },
      { name: "Galaxy Multiplex", city: "Bhopal", address: "Arera Hills, Bhopal", screens: 2, facilities: ["Parking", "Accessible Seating"] }
    ]);
    console.log(`Created ${theatres.length} sample theatres.`);
  }

  const showCount = await Show.countDocuments();
  if (!showCount && movies.length && theatres.length) {
    const shows = [];
    for (let day = 0; day < 7; day += 1) {
      for (let theatreIndex = 0; theatreIndex < theatres.length; theatreIndex += 1) {
        for (let timeIndex = 0; timeIndex < times.length; timeIndex += 1) {
          const movie = movies[(day * times.length + timeIndex + theatreIndex * 2) % movies.length];
          shows.push({
            movie: movie._id,
            theatre: theatres[theatreIndex]._id,
            screenName: `Screen ${(timeIndex % Math.max(1, theatres[theatreIndex].screens)) + 1}`,
            showDate: indiaDate(day), showTime: times[timeIndex], language: movie.language,
            price: movie.price, seatRows: 6, seatsPerRow: 8, status: "scheduled"
          });
        }
      }
    }
    await Show.insertMany(shows, { ordered: false });
    console.log(`Created ${shows.length} sample shows across ${theatres.length} theatres.`);
  }
}
