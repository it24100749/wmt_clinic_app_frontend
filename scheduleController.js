const Schedule = require("../models/Schedule");

// CREATE schedule (Admin)
exports.createSchedule = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, consultationFee } = req.body;

    // Validate Date (No past dates)
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (scheduleDate < today) {
      return res.status(400).json({ message: "Cannot create schedule for a past date." });
    }

    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    const formatMinutesToTime = (totalMinutes) => {
      let hours = Math.floor(totalMinutes / 60);
      let minutes = totalMinutes % 60;
      const period = hours >= 12 ? "PM" : "AM";
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    if (startMins >= endMins) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Fetch existing schedules for this doctor on the given date
    const existingSchedules = await Schedule.find({ doctor: doctorId, date });

    for (let s of existingSchedules) {
      const existingStart = parseTimeToMinutes(s.startTime);
      const existingEnd = parseTimeToMinutes(s.endTime);
      if (existingStart < endMins && existingEnd > startMins) {
        return res.status(400).json({ 
          message: `This time range overlaps with an existing schedule (${s.startTime} - ${s.endTime})` 
        });
      }
    }

    // Separate into 10-minute slots
    const slotDuration = 10;
    const slots = [];

    for (let current = startMins; current + slotDuration <= endMins; current += slotDuration) {
      slots.push({
        startTime: formatMinutesToTime(current),
        endTime: formatMinutesToTime(current + slotDuration),
        isBooked: false
      });
    }

    if (slots.length === 0) {
      return res.status(400).json({ message: "Time range is too short to create a 10-minute slot." });
    }

    const schedule = await Schedule.create({
      doctor: doctorId,
      date,
      startTime,
      endTime,
      consultationFee,
      slots
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all schedules (Admin)
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("doctor", "name email specialization");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE schedule (Admin)
exports.updateSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime, consultationFee, doctorId } = req.body;

    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    if (startMins >= endMins) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Validate Date (No past dates)
    const scheduleDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (scheduleDate < today) {
      return res.status(400).json({ message: "Cannot update schedule to a past date." });
    }

    const currentSchedule = await Schedule.findById(req.params.id);
    if (!currentSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Protection: Block update if slots are already booked
    const isAnySlotBooked = currentSchedule.slots.some(slot => slot.isBooked);
    if (isAnySlotBooked) {
      return res.status(400).json({ 
        message: "Cannot update this schedule because some slots are already booked. Please cancel the appointments first." 
      });
    }

    // Validation: Check for overlapping schedules (excluding this one)
    const docId = doctorId || currentSchedule.doctor;

    const existingSchedules = await Schedule.find({ 
      doctor: docId, 
      date,
      _id: { $ne: req.params.id }
    });

    for (let s of existingSchedules) {
      const existingStart = parseTimeToMinutes(s.startTime);
      const existingEnd = parseTimeToMinutes(s.endTime);
      if (existingStart < endMins && existingEnd > startMins) {
        return res.status(400).json({ 
          message: `This updated time slot overlaps with an existing schedule (${s.startTime} - ${s.endTime})` 
        });
      }
    }

    // Generate new slots
    const slotDuration = 10;
    const slots = [];

    for (let current = startMins; current + slotDuration <= endMins; current += slotDuration) {
      slots.push({
        startTime: formatMinutesToTime(current),
        endTime: formatMinutesToTime(current + slotDuration),
        isBooked: false
      });
    }

    if (slots.length === 0) {
      return res.status(400).json({ message: "Time range is too short to create a 10-minute slot." });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { date, startTime, endTime, consultationFee, doctor: docId, slots },
      { new: true }
    );
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE schedule (Admin)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Protection: Block delete if slots are already booked
    const isAnySlotBooked = schedule.slots.some(slot => slot.isBooked);
    if (isAnySlotBooked) {
      return res.status(400).json({ 
        message: "Cannot delete this schedule because some slots are already booked. Please cancel the appointments first." 
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET my schedule (Doctor)
exports.getMySchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find({ doctor: req.user.id }).populate("doctor", "name email specialization");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET doctor schedule (Patient)
exports.getDoctorSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find({ doctor: req.params.doctorId }).populate("doctor", "name email specialization");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};