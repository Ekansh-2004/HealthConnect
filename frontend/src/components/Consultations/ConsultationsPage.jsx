import React, { useState } from 'react';
import { Calendar, Clock, Video, User, Plus, CheckCircle, Phone } from 'lucide-react';

const ConsultationsPage = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [reason, setReason] = useState('');

  const doctors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Sexual Health',
      rating: 4.9,
      experience: '12 years',
      image:
        'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Reproductive Health',
      rating: 4.8,
      experience: '9 years',
      image:
        'https://images.pexels.com/photos/6303761/pexels-photo-6303761.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Adolescent Health',
      rating: 4.9,
      experience: '8 years',
      image:
        'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ];

  const appointments = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'General Sexual Health',
      date: '2024-01-25',
      time: '14:00',
      type: 'video',
      status: 'upcoming',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Reproductive Health',
      date: '2024-01-20',
      time: '10:30',
      type: 'phone',
      status: 'completed',
    },
  ];

  const availableTimes = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];

  const handleBookAppointment = () => {
    console.log('Booking appointment:', {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      reason: reason,
    });

    setShowBookingForm(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDoctor('');
    setReason('');

    alert('Appointment booked successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Consultation</h1>
          <p className="mt-2 text-gray-600">
            Book confidential consultations with healthcare professionals
          </p>
        </div>

        {!showBookingForm && (
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </button>
        )}
      </div>

      {/* Booking Form */}
      {showBookingForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Book New Appointment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Doctor
              </label>
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor === doctor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {doctor.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {doctor.specialty}
                        </p>
                        <p className="text-xs text-gray-500">
                          ⭐ {doctor.rating} • {doctor.experience}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setConsultationType('video')}
                    className={`flex items-center px-4 py-2 border rounded-md transition-colors ${
                      consultationType === 'video'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </button>
                  <button
                    onClick={() => setConsultationType('phone')}
                    className={`flex items-center px-4 py-2 border rounded-md transition-colors ${
                      consultationType === 'phone'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief description of what you'd like to discuss..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setShowBookingForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Appointments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments
            .filter((apt) => apt.status === 'upcoming')
            .map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600">
                    {appointment.type === 'video' ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Phone className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {appointment.time}
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Join Appointment
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Past Appointments
        </h2>
        <div className="space-y-4">
          {appointments
            .filter((apt) => apt.status === 'completed')
            .map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.doctorName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {appointment.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{new Date(appointment.date).toLocaleDateString()}</p>
                    <p>{appointment.time}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultationsPage;
