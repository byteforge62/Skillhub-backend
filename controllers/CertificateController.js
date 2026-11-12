const CertificateService = require("../services/CertificateService");
const catchAsync = require("../utils/catchAsync");
const ResponseHandler = require("../utils/ResponseHandler");
const AppError = require("../utils/AppError");

const sameId = (left, right) =>
  String(left).toLowerCase() === String(right).toLowerCase();

const AddCertificate = catchAsync(async (req, res) => {
  const certificate = await CertificateService.addCertificate(req.validated.body);
  return ResponseHandler.success(
    res,
    "Certificate Added Successfully",
    certificate,
    201,
  );
});

const GetCertificatesByUserId = catchAsync(async (req, res) => {
  const { userId } = req.validated.params;
  if (!sameId(userId, req.user.id) && req.user.role !== "admin") {
    throw new AppError("Not authorized to view these certificates", 403);
  }
  const certificates = await CertificateService.getCertificatesByUserId(
    userId,
  );
  return ResponseHandler.success(
    res,
    "Certificates fetched successfully",
    certificates,
  );
});

module.exports = {
  AddCertificate,
  GetCertificatesByUserId,
};
