const CertificateModel = require("../models/CertificatesModel");

const addCertificate = async (certificateData) => {
    return CertificateModel.create({
        userId: certificateData.userId,
        courseId: certificateData.courseId,
        certificateUrl: certificateData.certificateUrl,
    });
};

const getCertificatesByUserId = async (userId) => {
    const certificates = await CertificateModel.find({userId,});
    return certificates;
};

module.exports = {
    addCertificate,
    getCertificatesByUserId,
};