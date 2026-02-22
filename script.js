let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let doneTasks = JSON.parse(localStorage.getItem("doneTasks") || "[]");

/* -------------------------
   相対時間
-------------------------- */
function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const target = new Date(dateStr);
    const diffMs = target - now;
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)}分${diffMin < 0 ? "前" : "後"}`;
    if (Math.abs(diffHour) < 24) return `${Math.abs(diffHour)}時間${diffHour < 0 ? "前" : "後"}`;
    return `${Math.abs(diffDay)}日${diffDay < 0 ? "前" : "後"}`;
}

/* -------------------------
   保存
-------------------------- */
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("doneTasks", JSON.stringify(doneTasks));
}

/* -------------------------
   タスク描画（削除ボタン追加）
-------------------------- */
function renderTasks() {
    $("#taskList").empty();

    tasks.forEach((t, i) => {
        const relative = formatRelativeTime(t.date);

        const card = $(`
            <div class="p-3 mb-3 rounded shadow-sm fade-in d-flex justify-content-between align-items-center"
                 style="background:${t.color}20;"
                 data-index="${i}">
                 
                <div>
                    <div class="d-flex align-items-center mb-1">
                        <div class="rounded-circle border me-2"
                             style="width:20px;height:20px;background:${t.color};"></div>
                        <strong class="fs-5">${t.title}</strong>
                    </div>

                    ${
                        t.date
                        ? `<small class="text-dark opacity-75">
                            <i class="bi bi-calendar-event"></i>
                            ${t.date}（${relative}）
                           </small>`
                        : `<small class="text-secondary fst-italic">期限なし</small>`
                    }
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark btn-sm done-btn" title="完了">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm delete-btn" title="削除">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
        `);

        $("#taskList").append(card);
    });

    $("#taskList").sortable({
        update: function () {
            const newOrder = [];
            $("#taskList > div").each(function () {
                newOrder.push(tasks[$(this).data("index")]);
            });
            tasks = newOrder;
            save();
        }
    });
}

/* -------------------------
   完了タスク描画（戻すボタン追加）
-------------------------- */
function renderDoneTasks() {
    $("#doneList").empty();
    doneTasks.slice(-10).forEach((t, i) => {
        $("#doneList").append(`
            <div class="alert alert-secondary shadow-sm fade-in d-flex justify-content-between align-items-center">
                <div>
                    <strong>${t.title}</strong>
                    <br>
                    <small class="text-dark opacity-75">完了：${t.doneAt}</small>
                </div>

                <button class="btn btn-outline-primary btn-sm restore-btn" data-index="${i}">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
            </div>
        `);
    });
}

/* -------------------------
   タスク追加
-------------------------- */
$("#addTask").on("click", () => {
    const title = $("#taskTitle").val();
    const date = $("#taskDate").val();
    const color = $("#taskColor").val();

    if (!title) {
        alert("タスク名は必須です");
        return;
    }

    tasks.push({ title, date, color });
    save();
    renderTasks();
});

/* -------------------------
   完了ボタン
-------------------------- */
$("#taskList").on("click", ".done-btn", function () {
    const card = $(this).closest("div[data-index]");
    const index = card.data("index");

    card.addClass("fade-out");

    setTimeout(() => {
        const task = tasks.splice(index, 1)[0];
        task.doneAt = new Date().toLocaleString();
        doneTasks.push(task);

        save();
        renderTasks();
        renderDoneTasks();
    }, 350);
});

/* -------------------------
   削除ボタン
-------------------------- */
$("#taskList").on("click", ".delete-btn", function () {
    const card = $(this).closest("div[data-index]");
    const index = card.data("index");

    card.addClass("fade-out");

    setTimeout(() => {
        tasks.splice(index, 1);
        save();
        renderTasks();
    }, 350);
});

/* -------------------------
   完了タスク → 未完了に戻す
-------------------------- */
$("#doneList").on("click", ".restore-btn", function () {
    const index = $(this).data("index");
    const task = doneTasks.splice(index, 1)[0];

    delete task.doneAt; // 完了日時を削除
    tasks.push(task);   // 未完了タスクの末尾へ

    save();
    renderTasks();
    renderDoneTasks();
});

/* 初期描画 */
renderTasks();
renderDoneTasks();
