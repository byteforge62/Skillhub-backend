const route = require("express").Router()
const CertificateController = require("../controllers/CertificateController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validate")
const {
  addCertificateSchema,
  userIdParamsSchema,
} = require("../validations/certificate.validation")
route.post(
  "/certificate",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validate(addCertificateSchema),
  CertificateController.AddCertificate,
)
route.get(
  "/certificates/:userId",
  authMiddleware.verifyToken,
  validate(userIdParamsSchema),
  CertificateController.GetCertificatesByUserId,
)
module.exports = route;