const db = require("./models/db");

// Helper function to calculate reading time
function estimateReadingTime(content) {
  if (!content) return "1 min read"; 
  const text = content.replace(/<[^>]*>/g, " "); 
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200); 
  return `${minutes} min read`;
}

// Main function to update all subtopics
async function updateEstimatedTimes() {
  try {
    const [lessons] = await db.query(
      "SELECT id, subtopic_id, content FROM education_lessons"
    );

    if (lessons.length === 0) {
      return;
    }

    for (const lesson of lessons) {
      const estimatedTime = estimateReadingTime(lesson.content);

     
      await db.query(
        "UPDATE education_subtopics SET estimated_time = ? WHERE id = ?",
        [estimatedTime, lesson.subtopic_id]
      );
    }
  } catch (err) {
    console.error("Error updating estimated times:", err);
  } finally {
    process.exit();
  }
}


updateEstimatedTimes();
