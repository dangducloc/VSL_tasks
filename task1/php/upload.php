<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $uploadDir = __DIR__ . '/images/';
        $uploadFile = $uploadDir . $_FILES['file']['name']; // leave here for pathtraversal

        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
            echo "File uploaded successfully as: " . $_FILES['file']['name'];
        } else {
            echo "Upload failed.";
        }
    } else {
        echo "No file uploaded.";
    }
}
?>
