const route = require("express").Router();

const ResourceController = require("../controllers/ResourceController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {createResourceSchema,updateResourceSchema,resourceQuerySchema} = require("../validations/resource.validation");

route.post("/resources",authMiddleware.verifyToken,validate(createResourceSchema),ResourceController.CreateResource);
route.get("/resources",authMiddleware.verifyToken,validate(resourceQuerySchema),ResourceController.GetResources);
route.get("/resources/:resourceId",authMiddleware.verifyToken,ResourceController.GetResourceById);
route.patch("/resources/:resourceId",authMiddleware.verifyToken,validate(updateResourceSchema),ResourceController.UpdateResource);
route.delete("/resources/:resourceId",authMiddleware.verifyToken,ResourceController.DeleteResource);

module.exports = route;