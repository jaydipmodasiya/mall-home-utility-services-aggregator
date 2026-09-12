require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");
const Category = require("../models/Category");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

const seed = async () => {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    ServiceProvider.deleteMany(),
    Category.deleteMany(),
    Booking.deleteMany(),
    Review.deleteMany(),
  ]);

  // ---- Categories ----
  const categories = await Category.insertMany([
    {
      name: "electrician",
      displayName: "Electrician",
      description:
        "Wiring, fan installation, circuit breakers, power outages and all electrical work.",
      icon: "zap",
      basePrice: 299,
      pricingGuideline: "Starting from ₹299 visiting charge + ₹150/hr labor",
    },
    {
      name: "plumber",
      displayName: "Plumber",
      description:
        "Pipe leaks, tap repair, drainage, water heater installation and all plumbing.",
      icon: "droplets",
      basePrice: 249,
      pricingGuideline: "Starting from ₹249 visiting charge + ₹130/hr labor",
    },
    {
      name: "carpenter",
      displayName: "Carpenter",
      description:
        "Furniture repair, door/window fixing, custom woodwork and installations.",
      icon: "hammer",
      basePrice: 349,
      pricingGuideline: "Starting from ₹349 visiting charge + ₹180/hr labor",
    },
    {
      name: "tailor",
      displayName: "Tailor",
      description:
        "Stitching, alterations, uniform repairs, curtains and all tailoring needs.",
      icon: "scissors",
      basePrice: 99,
      pricingGuideline: "Starting from ₹99 per alteration",
    },
    {
      name: "maintenance",
      displayName: "Maintenance Staff",
      description:
        "General maintenance, deep cleaning, painting touch-ups, handyman services.",
      icon: "wrench",
      basePrice: 199,
      pricingGuideline: "Starting from ₹199 visiting charge + ₹120/hr labor",
    },
  ]);

  console.log("✅ Categories seeded");

  // ---- Admin User ----
  const admin = await User.create({
    name: "Admin User",
    email: "admin@mallutility.in",
    password: "Admin@1234",
    role: "admin",
    phone: "9000000001",
  });

  // ---- Customer Users ----
  const customers = await User.create([
    {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: "Test@1234",
      role: "customer",
      phone: "9876543210",
      address: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    },
    {
      name: "Rahul Mehta",
      email: "rahul@example.com",
      password: "Test@1234",
      role: "customer",
      phone: "9876543211",
      address: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
    },
    {
      name: "Anjali Patel",
      email: "anjali@example.com",
      password: "Test@1234",
      role: "customer",
      phone: "9876543212",
      address: { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
    },
  ]);

  // ---- Provider Users ----
  const providerUsers = await User.create([
    {
      name: "Ravi Kumar",
      email: "ravi@example.com",
      password: "Test@1234",
      role: "provider",
      phone: "9111111101",
    },
    {
      name: "Suresh Nair",
      email: "suresh@example.com",
      password: "Test@1234",
      role: "provider",
      phone: "9111111102",
    },
    {
      name: "Mohammed Ilyas",
      email: "ilyas@example.com",
      password: "Test@1234",
      role: "provider",
      phone: "9111111103",
    },
    {
      name: "Deepak Singh",
      email: "deepak@example.com",
      password: "Test@1234",
      role: "provider",
      phone: "9111111104",
    },
    {
      name: "Arjun Pillai",
      email: "arjun@example.com",
      password: "Test@1234",
      role: "provider",
      phone: "9111111105",
    },
  ]);

  // ---- Provider Profiles ----
  const providerProfiles = await ServiceProvider.insertMany([
    {
      userId: providerUsers[0]._id,
      bio: "Certified electrician with 8 years of experience in residential and commercial wiring.",
      serviceCategories: ["electrician"],
      skills: [
        "Wiring",
        "Fan Installation",
        "MCB/Fuse",
        "Inverter Setup",
        "LED Fitting",
      ],
      experience: 8,
      pricing: { hourlyRate: 150, visitingCharge: 299 },
      location: {
        city: "Mumbai",
        area: "Andheri",
        state: "Maharashtra",
        pincode: "400053",
      },
      isVerified: true,
      verificationStatus: "approved",
      isAvailable: true,
      rating: 4.7,
      totalReviews: 42,
      completedJobs: 58,
      totalEarnings: 74500,
      availabilitySlots: [
        { day: "monday", startTime: "09:00", endTime: "18:00" },
        { day: "tuesday", startTime: "09:00", endTime: "18:00" },
        { day: "wednesday", startTime: "09:00", endTime: "18:00" },
        { day: "thursday", startTime: "09:00", endTime: "18:00" },
        { day: "friday", startTime: "09:00", endTime: "18:00" },
        { day: "saturday", startTime: "09:00", endTime: "14:00" },
      ],
    },
    {
      userId: providerUsers[1]._id,
      bio: "Expert plumber handling leaks, drainage and water heating for 10 years in Bengaluru.",
      serviceCategories: ["plumber"],
      skills: [
        "Pipe Leak Fix",
        "Tap Repair",
        "Drainage Cleaning",
        "Water Heater",
        "RO Installation",
      ],
      experience: 10,
      pricing: { hourlyRate: 130, visitingCharge: 249 },
      location: {
        city: "Bengaluru",
        area: "Koramangala",
        state: "Karnataka",
        pincode: "560034",
      },
      isVerified: true,
      verificationStatus: "approved",
      isAvailable: true,
      rating: 4.5,
      totalReviews: 31,
      completedJobs: 44,
      totalEarnings: 52000,
      availabilitySlots: [
        { day: "monday", startTime: "08:00", endTime: "17:00" },
        { day: "tuesday", startTime: "08:00", endTime: "17:00" },
        { day: "wednesday", startTime: "08:00", endTime: "17:00" },
        { day: "thursday", startTime: "08:00", endTime: "17:00" },
        { day: "friday", startTime: "08:00", endTime: "17:00" },
      ],
    },
    {
      userId: providerUsers[2]._id,
      bio: "Skilled carpenter specializing in furniture repair and custom woodwork.",
      serviceCategories: ["carpenter"],
      skills: [
        "Furniture Repair",
        "Door Fixing",
        "Custom Shelves",
        "Wood Polish",
        "Cabinet Work",
      ],
      experience: 12,
      pricing: { hourlyRate: 180, visitingCharge: 349 },
      location: {
        city: "Mumbai",
        area: "Bandra",
        state: "Maharashtra",
        pincode: "400050",
      },
      isVerified: true,
      verificationStatus: "approved",
      isAvailable: true,
      rating: 4.8,
      totalReviews: 67,
      completedJobs: 89,
      totalEarnings: 118000,
      availabilitySlots: [
        { day: "monday", startTime: "09:00", endTime: "19:00" },
        { day: "wednesday", startTime: "09:00", endTime: "19:00" },
        { day: "friday", startTime: "09:00", endTime: "19:00" },
        { day: "saturday", startTime: "10:00", endTime: "17:00" },
      ],
    },
    {
      userId: providerUsers[3]._id,
      bio: "Professional tailor for uniforms, alterations and home stitching needs.",
      serviceCategories: ["tailor"],
      skills: [
        "Alterations",
        "Blouse Stitching",
        "Uniform Repair",
        "Curtains",
        "Kids Wear",
      ],
      experience: 6,
      pricing: { hourlyRate: 80, visitingCharge: 99 },
      location: {
        city: "Ahmedabad",
        area: "Satellite",
        state: "Gujarat",
        pincode: "380015",
      },
      isVerified: true,
      verificationStatus: "approved",
      isAvailable: false,
      rating: 4.3,
      totalReviews: 19,
      completedJobs: 27,
      totalEarnings: 18000,
      availabilitySlots: [
        { day: "tuesday", startTime: "10:00", endTime: "16:00" },
        { day: "thursday", startTime: "10:00", endTime: "16:00" },
        { day: "saturday", startTime: "10:00", endTime: "18:00" },
      ],
    },
    {
      userId: providerUsers[4]._id,
      bio: "General maintenance expert for malls, apartments and commercial spaces.",
      serviceCategories: ["maintenance", "electrician"],
      skills: [
        "Deep Cleaning",
        "Painting Touch-up",
        "AC Service",
        "Handyman",
        "Pest Control Prep",
      ],
      experience: 5,
      pricing: { hourlyRate: 120, visitingCharge: 199 },
      location: {
        city: "Bengaluru",
        area: "Whitefield",
        state: "Karnataka",
        pincode: "560066",
      },
      isVerified: false,
      verificationStatus: "under_review",
      isAvailable: true,
      rating: 0,
      totalReviews: 0,
      completedJobs: 0,
      totalEarnings: 0,
    },
  ]);

  console.log("✅ Providers seeded");

  // ---- Sample Bookings ----
  const booking1 = await Booking.create({
    customerId: customers[0]._id,
    providerId: providerProfiles[0]._id,
    serviceCategory: "electrician",
    serviceDescription:
      "Need to fix two power sockets in the living room and install a ceiling fan in the bedroom.",
    bookingType: "scheduled",
    scheduledAt: new Date(Date.now() - 2 * 24 * 3600000),
    serviceLocation: {
      address: "Flat 4B, Sea View Apartments",
      city: "Mumbai",
      area: "Andheri",
      pincode: "400053",
    },
    status: "completed",
    estimatedAmount: 299,
    finalAmount: 449,
    isReviewed: true,
    completedAt: new Date(Date.now() - 3600000),
    statusHistory: [
      { previousStatus: null, status: "pending", changedBy: customers[0]._id },
      { previousStatus: "pending", status: "assigned", changedBy: providerUsers[0]._id },
      { previousStatus: "assigned", status: "in_progress", changedBy: providerUsers[0]._id },
      { previousStatus: "in_progress", status: "completed", changedBy: providerUsers[0]._id },
    ],
  });

  const booking2 = await Booking.create({
    customerId: customers[1]._id,
    providerId: providerProfiles[1]._id,
    serviceCategory: "plumber",
    serviceDescription:
      "Kitchen tap is leaking continuously and bathroom drainage is clogged.",
    bookingType: "instant",
    serviceLocation: {
      address: "12 MG Road",
      city: "Bengaluru",
      area: "Koramangala",
      pincode: "560034",
    },
    status: "in_progress",
    estimatedAmount: 249,
    statusHistory: [
      { previousStatus: null, status: "pending", changedBy: customers[1]._id },
      { previousStatus: "pending", status: "assigned", changedBy: providerUsers[1]._id },
      { previousStatus: "assigned", status: "in_progress", changedBy: providerUsers[1]._id },
    ],
  });

  const booking3 = await Booking.create({
    customerId: customers[0]._id,
    providerId: providerProfiles[0]._id,
    serviceCategory: "electrician",
    serviceDescription:
      "Power trip happening every evening. MCB keeps tripping.",
    bookingType: "scheduled",
    scheduledAt: new Date(Date.now() + 24 * 3600000),
    serviceLocation: {
      address: "Flat 4B, Sea View Apartments",
      city: "Mumbai",
      area: "Andheri",
      pincode: "400053",
    },
    status: "pending",
    estimatedAmount: 299,
    statusHistory: [{ previousStatus: null, status: "pending", changedBy: customers[0]._id }],
  });

  // ---- Sample Review ----
  await Review.create({
    bookingId: booking1._id,
    customerId: customers[0]._id,
    providerId: providerProfiles[0]._id,
    rating: 5,
    comment:
      "Ravi was on time, very professional and did the work cleanly. Highly recommend!",
    serviceCategory: "electrician",
  });

  console.log("✅ Bookings and reviews seeded");

  console.log("\n========================================");
  console.log("🎉 Database seeded successfully!");
  console.log("========================================");
  console.log("\n🔑 Login Credentials:");
  console.log("  Admin:    admin@mallutility.in  / Admin@1234");
  console.log("  Customer: priya@example.com   / Test@1234");
  console.log("  Provider: ravi@example.com    / Test@1234");
  console.log("========================================\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
