// educationController.js
const db = require("../../models/db");

// ========================= Helper Function =========================
// Calculate estimated reading time from lesson content
function estimateReadingTime(content) {
  if (!content) return "1 min read"; // fallback if empty
  const text = content.replace(/<[^>]*>/g, " "); // remove HTML tags
  const words = text.trim().split(/\s+/).length;
  if (words === 0) return "1 min read";
  const minutes = Math.ceil(words / 200); // average reading speed
  return `${minutes} min read`;
}

// ========================= Topics =========================
exports.getTopics = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM education_topics");
    res.json({ topics: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================= Subtopics =========================
exports.getSubtopics = async (req, res) => {
  const topicId = req.params.topicId;
  try {
    const [rows] = await db.query(
      "SELECT * FROM education_subtopics WHERE topic_id = ? ORDER BY order_index",
      [topicId]
    );

    // Remove any leading slashes or "/images/" in the DB field
    const updatedSubtopics = rows.map(subtopic => {
      let fileName = subtopic.image || null;

      if (fileName) {
        // Remove leading slashes and "images/" if present
        fileName = fileName.replace(/^\/+/, ''); // remove starting /
        fileName = fileName.replace(/^images\//, ''); // remove leading images/
      }

      return {
        ...subtopic,
        image: fileName
          ? `${req.protocol}://${req.get('host')}/images/${fileName}`
          : null
      };
    });

    res.json({ subtopics: updatedSubtopics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ========================= Lesson =========================
exports.getLesson = async (req, res) => {
  const subtopicId = req.params.subtopicId;
  try {
    // Fetch lesson along with subtopic title and subtitle
    const [rows] = await db.query(
      `
      SELECT 
        l.*, 
        s.title AS subtopic_name, 
        s.subtitle AS subtopic_subtitle
      FROM education_lessons l
      JOIN education_subtopics s ON l.subtopic_id = s.id
      WHERE l.subtopic_id = ?
      `,
      [subtopicId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    let lesson = rows[0];

    // Use the subtitle from subtopic table
    lesson.subtitle = lesson.subtopic_subtitle || 'The essential facts on nutrition, immunity, and lifelong bonding for both mother and baby';

    // Build full image URL if image exists (leave this as-is)
    if (lesson.image) {
      let fileName = lesson.image.replace(/^\/+/, '');
      fileName = fileName.replace(/^images\//, '');
      lesson.image = `${req.protocol}://${req.get('host')}/images/${fileName}`;
    }

    // ===== Updated videos to full URLs =====
    if (lesson.videos) {
      let videoList;
      try { 
        videoList = JSON.parse(lesson.videos); // parse JSON string from DB
      } catch { 
        videoList = []; 
      }

      // Convert to full URLs
      lesson.videos = videoList.map(filePath => {
        filePath = filePath.replace(/^\/+/, ''); 
        return `${req.protocol}://${req.get('host')}/videos/${filePath.split('/').pop()}`;
      
      });
    }

    res.json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ========================= Create Lesson =========================
exports.createLesson = async (req, res) => {
  const { subtopic_id, content, image, videos } = req.body;

  try {
    const estimatedTime = estimateReadingTime(content);

    const [result] = await db.query(
      "INSERT INTO education_lessons (subtopic_id, content, image, videos) VALUES (?, ?, ?, ?)",
      [subtopic_id, content, image, JSON.stringify(videos || [])]
    );

    await db.query(
      "UPDATE education_subtopics SET estimated_time = ? WHERE id = ?",
      [estimatedTime, subtopic_id]
    );

    res.status(201).json({
      message: "Lesson created successfully",
      lessonId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================= Update Lesson =========================
exports.updateLesson = async (req, res) => {
  const { lessonId, content, image, videos } = req.body;

  try {
    const estimatedTime = estimateReadingTime(content);

    await db.query(
      "UPDATE education_lessons SET content = ?, image = ?, videos = ? WHERE id = ?",
      [content, image, JSON.stringify(videos || []), lessonId]
    );

    const [lessonRows] = await db.query(
      "SELECT subtopic_id FROM education_lessons WHERE id = ?",
      [lessonId]
    );

    if (lessonRows[0]) {
      await db.query(
        "UPDATE education_subtopics SET estimated_time = ? WHERE id = ?",
        [estimatedTime, lessonRows[0].subtopic_id]
      );
    }

    res.json({ message: "Lesson updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
