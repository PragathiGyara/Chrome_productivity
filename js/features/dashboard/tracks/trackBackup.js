// =====================================================
// TRACK BACKUP
//
// Responsibilities:
// - Generate PDF backup for a track
// =====================================================


function formatBackupDate(date = new Date()) {

    return date.toLocaleString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );

}


// =====================================================
// PAGE HELPERS
// =====================================================

function checkPageBreak(doc, y, requiredHeight = 10) {

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const bottomMargin = 20;

    if (y + requiredHeight > pageHeight - bottomMargin) {

        doc.addPage();

        return 20;

    }

    return y;

}


function generateTrackBackupPDF(track) {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 20;

    y = addHeader(doc, track, y);
    y = addReadingSection(doc, track, y);
    y = addTaskSection(doc, track, y);
    y = addDeadlineSection(doc, track, y);
    y = addNotesSection(doc, track, y);

    doc.save(`${track.name} Backup.pdf`);
}

// =====================================================
// HEADER
// =====================================================

function addHeader(doc, track, y) {

    const pageWidth = doc.internal.pageSize.getWidth();

    // ------------------------------------------
    // Track Name
    // ------------------------------------------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(
        track.name,
        20,
        y
    );

    // ------------------------------------------
    // Backup Date
    // ------------------------------------------

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
        `Backup Date: ${formatBackupDate()}`,
        20,
        y
    );

    // ------------------------------------------
    // Divider
    // ------------------------------------------

    y += 8;

    doc.line(
        20,
        y,
        pageWidth - 20,
        y
    );

    return y + 12;

}

// =====================================================
// LINK HELPERS
// =====================================================

function getDisplayNameFromURL(url) {

    try {

        const hostname = new URL(url).hostname;

        return hostname.replace(/^www\./, "");

    }
    catch {

        return url;

    }

}

// =====================================================
// READING
// =====================================================

function addReadingSection(doc, track, y) {

    const pageWidth = doc.internal.pageSize.getWidth();

    // ------------------------------------------
    // Section Heading
    // ------------------------------------------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Reading", 20, y);

    y += 8;

    // ------------------------------------------
    // Empty Reading List
    // ------------------------------------------

    if (track.reading.length === 0) {

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        doc.text("No reading items.", 20, y);

        return y + 12;
    }

    // ------------------------------------------
    // Table Header
    // ------------------------------------------

    const topicX = 20;
    const linkX = 110;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Reading Item", topicX, y);
    doc.text("Links", linkX, y);

    y += 4;

    doc.line(20, y, pageWidth - 20, y);

    y += 8;

    // ------------------------------------------
    // Table Rows
    // ------------------------------------------

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    track.reading.forEach((item, index) => {
    const estimatedHeight =
        Math.max(8, (item.links?.length || 1) * 6 + 4);

    y = checkPageBreak(
        doc,
        y,
        estimatedHeight
    );

    // -------------------------------
    // Reading Item
    // -------------------------------

    doc.setTextColor(0, 0, 0);

    doc.text(
        `${index + 1}. ${item.topic}`,
        topicX,
        y
    );

    // -------------------------------
    // Links
    // -------------------------------

    if (!item.links || item.links.length === 0) {

        doc.text(
            "None",
            linkX,
            y
        );

        y += 8;

    }
    else {

        const rowStartY = y;

        item.links.forEach(link => {

            const displayName =
                getDisplayNameFromURL(link);

            doc.setTextColor(0, 0, 255);

            doc.textWithLink(
                displayName,
                linkX,
                y,
                {
                    url: link
                }
            );

            y += 6;

        });

        doc.setTextColor(0, 0, 0);

        // Ensure spacing after each row
        y += 2;

    }

});

    return y + 10;

}

// =====================================================
// TASKS
// =====================================================

function addTaskSection(doc, track, y) {

    const pageWidth = doc.internal.pageSize.getWidth();

    // ------------------------------------------
    // Section Heading
    // ------------------------------------------

    y = checkPageBreak(doc, y, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Tasks", 20, y);

    y += 8;

    // ------------------------------------------
    // Empty State
    // ------------------------------------------

    if (track.tasks.length === 0) {

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        doc.text("No tasks.", 20, y);

        return y + 12;

    }

    // ------------------------------------------
    // Task List
    // ------------------------------------------

    track.tasks.forEach((task, index) => {

        y = checkPageBreak(doc, y, 70);

        // -----------------------------
        // Task Name
        // -----------------------------

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);

        doc.text(
            `${index + 1}. ${task.name}`,
            20,
            y
        );

        y += 7;

        // -----------------------------
        // Description
        // -----------------------------

        if (task.description) {

            y = checkPageBreak(doc, y, 15);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);

            doc.text("Description", 20, y);

            y += 6;

            doc.setFont("helvetica", "normal");

            const descriptionLines =
                doc.splitTextToSize(
                    task.description,
                    pageWidth - 45
                );

            descriptionLines.forEach(line => {

                y = checkPageBreak(doc, y, 6);

                doc.text(line, 25, y);

                y += 6;

            });

            y += 3;

        }

        // -----------------------------
        // Prerequisite
        // -----------------------------

        if (task.prereq) {

            y = checkPageBreak(doc, y, 15);

            doc.setFont("helvetica", "bold");

            doc.text("Prerequisite", 20, y);

            y += 6;

            doc.setFont("helvetica", "normal");

            doc.text(task.prereq, 25, y);

            y += 9;

        }

        // -----------------------------
        // Progress
        // -----------------------------

        y = checkPageBreak(doc, y, 20);

        doc.setFont("helvetica", "bold");

        doc.text("Progress", 20, y);

        y += 6;

        doc.setFont("helvetica", "normal");

        doc.text(
            `Prerequisite : ${formatHours(task.prereqSpent || 0)} / ${formatHours(task.prereqTime)}`,
            25,
            y
        );

        y += 6;

        doc.text(
            `Task : ${formatHours(task.taskSpent || 0)} / ${formatHours(task.taskTime)}`,
            25,
            y
        );

        y += 8;

        // -----------------------------
        // Status
        // -----------------------------

        y = checkPageBreak(doc, y, 15);

        doc.setFont("helvetica", "bold");

        doc.text("Status", 20, y);

        y += 6;

        doc.setFont("helvetica", "normal");

        doc.text(
            task.finished
                ? "Completed"
                : "In Progress",
            25,
            y
        );

        y += 10;

        // -----------------------------
        // Divider
        // -----------------------------

        y = checkPageBreak(doc, y, 2);

        doc.line(
            20,
            y,
            pageWidth - 20,
            y
        );

        y += 10;

    });

    return y;

}

// =====================================================
// DEADLINES
// =====================================================

function addDeadlineSection(doc, track, y) {

    doc.setFontSize(16);
    doc.text("Deadlines", 20, y);

    return y + 15;
}

// =====================================================
// NOTES
// =====================================================

function addNotesSection(doc, track, y) {

    doc.setFontSize(16);
    doc.text("Notes", 20, y);

    return y + 15;
}