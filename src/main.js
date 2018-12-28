const AUTO_MATE_DATA = "auto_mate_data";
const AUTO_MATE_VARS = "auto_mate_vars";

var app;

async function run() {
    new Storage((st) => {
        app = new AppView(st);
        app.render();
    });
}

$(document).ready(run);