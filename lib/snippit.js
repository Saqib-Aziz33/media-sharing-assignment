// ROUTER
const { Router } = require("express");
const router = Router();

router.route("/").get().post();

module.exports = router;

// CONTROLLER
const c1 = asyncHandler(async (req, res) => {});
const c2 = (req, res) => {};

module.exports = {};

// DASHBOARD VIEW
`
<div class="content-header">
          <div class="container-fluid">
            <h1 class="m-0 text-dark">Dashboard</h1>
          </div>
        </div>
        <div class="content">
          <div class="container-fluid">
            <p>Welcome to AdminLTE dashboard layout!</p>
          </div>
        </div>



`;
