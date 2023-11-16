const express = require('express');
const fs = require("fs");
const multer = require("multer"); // Підключення Multer для обробки завантаження файлів
const upload = multer({ dest: "uploads/" });  // Налаштування шляху для завантажених файлів
const notes_path = 'notes.json';
const app = express();
const path = require('path');
const port = 8000;

app.use(express.static(__dirname));

if (!fs.existsSync(notes_path)) {
    fs.writeFileSync(notes_path, '[]', 'utf-8');
}

app.get('/', (req, res) => {
    res.send('Сервер запущено')
})

app.get('/notes', (req, res) => {
    try {
        if (fs.existsSync(notes_path)) {
            const notes = JSON.parse(fs.readFileSync(notes_path, 'utf8'));
            res.json(notes);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error("Error while reading or parsing notes.json:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/UploadForm.html', (req, res) => {
    res.sendFile(__dirname + '/static/UploadForm.html');
});

app.post('/upload', upload.none(), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;
  
    // Перевірка наявності нотатки з вказаним ім'ям
    fs.readFile(notes_path, 'utf8', (err, notesData) => {
      if (err) {
        // Якщо файл не існує, створити новий файл та зберегти нотатку
        const newNote = { note_name: noteName, note_text: noteText };
        fs.writeFileSync(notes_path, JSON.stringify([newNote]));
        res.status(201).send('Нотатку створено успішно');
      } else {
        const notes = JSON.parse(notesData);
        const existingNote = notes.find((note) => note.note_name === noteName);
  
        if (existingNote) {
          // Якщо нотатка з таким ім'ям вже існує, повернути статус 400
          res.status(400).send("Нотатка з таким ім'ям вже існує. Оберіть іншу назву");
        } else {
          // Якщо нотатка не існує, додати нову нотатку до списку і зберегти у файл
          const newNote = { note_name: noteName, note_text: noteText };
          notes.push(newNote);
          fs.writeFileSync(notes_path, JSON.stringify(notes));
          res.status(201).send('Нотатку створено успішно');
        }
      }
    });
});

app.get('/notes/:noteName', (req,res) => {
    const noteName = req.params.noteName;
    const note = JSON.parse(fs.readFileSync(notes_path, 'utf8')); 
    
    const foundNote = note.find((data) => data.note_name === noteName);

    if (foundNote) {
        const textFromNote = foundNote.note_text.toString();
        res.status(200).send(textFromNote);
    } else {
        res.status(404).send("Нотатки з таким іменем не існує.");
    }

})

app.put('/notes/:noteName', express.text(), (req, res) => {
    const noteName = req.params.noteName;
    const updatedNoteText = req.body;

    const notes = JSON.parse(fs.readFileSync(notes_path, 'utf8'));
    const noteToUpdate = notes.find((data) => data.note_name === noteName);

    if (noteToUpdate) {
        noteToUpdate.note_text = updatedNoteText; 
        fs.writeFileSync(notes_path, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('Нотатку оновлено успішно.');
    } else {
        res.status(404).send('Нотатки з таким іменем не існує.');
    }
});

app.delete('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    let notes = JSON.parse(fs.readFileSync(notes_path, 'utf8'));
    const noteIndex = notes.findIndex((data) => data.note_name === noteName);

    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        fs.writeFileSync(notes_path, JSON.stringify(notes, null, 2), 'utf8');
        res.status(200).send('200: Нотатку видалено успішно.');
    } else {
        res.status(404).send('400: Нотатки з таким іменем не існує.');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущено тут -> http://localhost:${port}`);
});