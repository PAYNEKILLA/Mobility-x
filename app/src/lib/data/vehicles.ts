import type { Vehicle } from "../domain";

export const vehicles: Vehicle[] = [
  {
    id: "vehicle-001",
    ownerId: "partner-001",
    type: "car",
    make: "Toyota",
    model: "Corolla",
    registrationNumber: "MOB-001",
    maxWeightKg: 100,
    maxPackageCount: 4,
    verificationStatus: "verified",
  },

  {
    id: "vehicle-002",
    ownerId: "partner-002",
    type: "van",
    make: "Toyota",
    model: "Hiace",
    registrationNumber: "MOB-002",
    maxWeightKg: 500,
    maxPackageCount: 15,
    verificationStatus: "verified",
  },

  {
    id: "vehicle-003",
    ownerId: "partner-003",
    type: "motorcycle",
    make: "Honda",
    model: "CB125",
    registrationNumber: "MOB-003",
    maxWeightKg: 30,
    maxPackageCount: 2,
    verificationStatus: "verified",
  },

  {
    id: "vehicle-004",
    ownerId: "partner-004",
    type: "truck",
    make: "Mitsubishi",
    model: "Canter",
    registrationNumber: "MOB-004",
    maxWeightKg: 3000,
    maxPackageCount: 50,
    verificationStatus: "verified",
  },
];
