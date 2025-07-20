'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiCalendar, FiSearch, FiUser, FiLogOut, FiMapPin, FiClock, FiBus } from 'react-icons/fi';
import { MdDirectionsBus, MdQrCode } from 'react-icons/md';
import QRCode from 'qrcode';

export default function PassengerDashboard() {
  const [passenger, setPassenger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [schedules, setSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: '',
    date: '',
    agency: '',
    time: ''
  });
  
  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    passengerName: '',
    phone: '',
    specialRequests: ''
  });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  
  const router = useRouter();

  // Restore authentication logic
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'passenger') {
        router.push('/login');
        return;
      }
      setPassenger(user);
      setIsLoading(false); // Set loading to false after successful authentication
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
      return;
    }
  }, [router]);

  // Fetch schedules from bus agents
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!passenger) return;
      
      setIsLoadingSchedules(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/busagent/schedules', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Transform the data to match expected format
          const transformedSchedules = data.map(schedule => ({
            id: schedule._id || schedule.id,
            busNumber: schedule.busNumber,
            route: schedule.route,
            departure: schedule.departureTime,
            arrival: schedule.arrivalTime,
            date: schedule.date,
            price: schedule.price,
            agency: schedule.agency,
            availableSeats: schedule.seatsAvailable,
            totalSeats: schedule.totalSeats,
            status: schedule.status,
            bookedSeats: schedule.bookedSeats || [] // Add this for seat layout
          }));
          setSchedules(transformedSchedules);
        } else {
          console.error('Failed to fetch schedules');
          setSchedules([]);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    // Only fetch schedules when passenger is loaded and not loading
    if (passenger && !isLoading) {
      fetchSchedules();
    }
  }, [passenger, isLoading]);

  // Filter schedules based on search criteria
  useEffect(() => {
    let filtered = schedules.filter(s => s.status === 'active'); // Only show active schedules
    
    if (searchFilters.from) {
      filtered = filtered.filter(s => s.route.from.toLowerCase().includes(searchFilters.from.toLowerCase()));
    }
    if (searchFilters.to) {
      filtered = filtered.filter(s => s.route.to.toLowerCase().includes(searchFilters.to.toLowerCase()));
    }
    if (searchFilters.date) {
      filtered = filtered.filter(s => s.date === searchFilters.date);
    }
    if (searchFilters.agency) {
      filtered = filtered.filter(s => s.agency.toLowerCase().includes(searchFilters.agency.toLowerCase()));
    }
    if (searchFilters.time) {
      filtered = filtered.filter(s => s.departure.includes(searchFilters.time));
    }
    
    setFilteredSchedules(filtered);
  }, [searchFilters, schedules]);

  const handleSearchChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const generateQRCode = async (ticketData) => {
    try {
      const qrData = JSON.stringify({
        ticketId: ticketData.id,
        passenger: ticketData.passengerName,
        bus: ticketData.busNumber,
        route: `${ticketData.route.from} - ${ticketData.route.to}`,
        date: ticketData.date,
        time: ticketData.departure,
        seat: ticketData.seatNumber
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleBookTicket = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeat(null);
    setBookingForm({
      passengerName: passenger.name,
      phone: '',
      specialRequests: ''
    });
    setShowBookingModal(true);
  };

  const handleBookingFormChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  // Generate seat layout based on bus capacity
  const generateSeatLayout = (totalSeats, bookedSeats = []) => {
    const seats = [];
    const seatsPerRow = 4; // 2 seats on each side of aisle
    const rows = Math.ceil(totalSeats / seatsPerRow);
    
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seatInRow = 1; seatInRow <= seatsPerRow; seatInRow++) {
        const seatNumber = ((row - 1) * seatsPerRow) + seatInRow;
        if (seatNumber <= totalSeats) {
          rowSeats.push({
            number: seatNumber,
            id: `${row}${String.fromCharCode(64 + seatInRow)}`, // 1A, 1B, 1C, 1D format
            isBooked: bookedSeats.includes(seatNumber.toString()),
            position: seatInRow <= 2 ? 'left' : 'right' // left or right side of aisle
          });
        }
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const handleSeatSelect = (seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
      setBookingForm({ ...bookingForm, seatNumber: seat.id });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSeat) {
      alert('Please select a seat');
      return;
    }

    try {
      // Update the schedule in the database to reduce available seats
      const updateResponse = await fetch('/api/busagent/schedules/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          seatNumber: selectedSeat.id,
          passengerInfo: bookingForm
        })
      });

      if (updateResponse.ok) {
        const ticket = {
          id: `TKT-${Date.now()}`,
          ...selectedSchedule,
          ...bookingForm,
          seatNumber: selectedSeat.id,
          bookingDate: new Date().toISOString().slice(0, 10),
          status: 'confirmed'
        };
        
        const qrCode = await generateQRCode(ticket);
        setGeneratedTicket(ticket);
        setQrCodeUrl(qrCode);
        setMyTickets([...myTickets, ticket]);
        
        // Update local schedules to reflect reduced seat count
        setSchedules(schedules.map(s => 
          s.id === selectedSchedule.id 
            ? { ...s, availableSeats: s.availableSeats - 1 }
            : s
        ));
        
        setShowBookingModal(false);
        setShowTicketModal(true);
      } else {
        const errorData = await updateResponse.json();
        alert(errorData.error || 'Failed to book ticket');
      }
    } catch (error) {
      console.error('Error booking ticket:', error);
      alert('Error booking ticket: ' + error.message);
    }
  };

  // Simplified logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-xl text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title animate-gradient-text">BusEase</span>
          <span className="sidebar-subtitle">Passenger Portal</span>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => setSelectedSection('dashboard')}
            className={`sidebar-link ${selectedSection === 'dashboard' ? 'sidebar-link-active' : ''}`}
          >
            <FiHome className="mr-3" /> Dashboard
          </button>
          <button
            onClick={() => setSelectedSection('schedules')}
            className={`sidebar-link ${selectedSection === 'schedules' ? 'sidebar-link-active' : ''}`}
          >
            <FiCalendar className="mr-3" /> Schedules
          </button>
          <button
            onClick={() => setSelectedSection('myTickets')}
            className={`sidebar-link ${selectedSection === 'myTickets' ? 'sidebar-link-active' : ''}`}
          >
            <MdQrCode className="mr-3" /> My Tickets
          </button>
          <button
            onClick={() => setSelectedSection('profile')}
            className={`sidebar-link ${selectedSection === 'profile' ? 'sidebar-link-active' : ''}`}
          >
            <FiUser className="mr-3" /> Profile
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="btn btn-danger m-4 flex items-center justify-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="header">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <MdDirectionsBus className="text-3xl text-blue-500 animate-bounce-slow" />
              BusEase Passenger
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Welcome, {passenger.name}</span>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {passenger.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          {/* Dashboard Section */}
          {selectedSection === 'dashboard' && (
            <div className="w-full max-w-6xl mx-auto space-y-8">
              {/* Welcome Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-black flex items-center gap-3 mb-2">
                    <MdDirectionsBus className="text-blue-500 text-4xl animate-bounce-slow" />
                    Welcome, {passenger.name}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Book your bus tickets, view schedules, and manage your travel plans.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow">
                    {passenger.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Available Routes</h3>
                  <p className="text-4xl font-bold text-blue-600">{schedules.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">My Tickets</h3>
                  <p className="text-4xl font-bold text-green-600">{myTickets.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Bus Agencies</h3>
                  <p className="text-4xl font-bold text-orange-600">{[...new Set(schedules.map(s => s.agency))].length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Cities</h3>
                  <p className="text-4xl font-bold text-purple-600">{[...new Set([...schedules.map(s => s.route.from), ...schedules.map(s => s.route.to)])].length}</p>
                </div>
              </div>

              {/* Recent Schedules */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Popular Routes</h3>
                {isLoadingSchedules ? (
                  <div className="text-center py-4">Loading schedules...</div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No schedules available</div>
                ) : (
                  <div className="space-y-3">
                    {schedules.slice(0, 3).map((schedule) => (
                      <div key={schedule._id || schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MdDirectionsBus className="text-blue-500 text-xl" />
                          <div>
                            <p className="font-medium text-gray-800">{schedule.busNumber} - {schedule.route.from} to {schedule.route.to}</p>
                            <p className="text-sm text-gray-600">{schedule.agency || schedule.busAgent} • {schedule.date} • {schedule.departure}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{schedule.price} FCFA</p>
                          <p className="text-sm text-gray-500">{schedule.availableSeats} seats left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedules Section */}
          {selectedSection === 'schedules' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Bus Schedules</h1>
                
                {/* Search Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Search Schedules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <input
                      name="from"
                      value={searchFilters.from}
                      onChange={handleSearchChange}
                      placeholder="From (City)"
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      name="to"
                      value={searchFilters.to}
                      onChange={handleSearchChange}
                      placeholder="To (City)"
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      name="date"
                      type="date"
                      value={searchFilters.date}
                      onChange={handleSearchChange}
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      name="agency"
                      value={searchFilters.agency}
                      onChange={handleSearchChange}
                      placeholder="Bus Agency"
                      className="border px-3 py-2 rounded-lg"
                    />
                    <input
                      name="time"
                      value={searchFilters.time}
                      onChange={handleSearchChange}
                      placeholder="Time (e.g., 08:00)"
                      className="border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                {/* Schedules Grid */}
                {isLoadingSchedules ? (
                  <div className="text-center py-8">
                    <div className="text-xl">Loading schedules...</div>
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">No schedules found matching your criteria</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSchedules.map((schedule) => (
                      <div key={schedule._id || schedule.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <MdDirectionsBus className="text-blue-500 text-2xl" />
                            <span className="font-bold text-gray-800">{schedule.busNumber}</span>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{schedule.agency || schedule.busAgent}</span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-gray-500" />
                            <span className="text-gray-700">{schedule.route.from} → {schedule.route.to}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock className="text-gray-500" />
                            <span className="text-gray-700">{schedule.departure} - {schedule.arrival}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-gray-500" />
                            <span className="text-gray-700">{schedule.date}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{schedule.price} FCFA</p>
                            <p className="text-sm text-gray-500">{schedule.availableSeats}/{schedule.totalSeats} seats available</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleBookTicket(schedule)}
                          disabled={schedule.availableSeats === 0}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            schedule.availableSeats === 0 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                          }`}
                        >
                          {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Ticket'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Tickets Section */}
          {selectedSection === 'myTickets' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">My Tickets</h1>
                {myTickets.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <MdQrCode className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tickets booked yet</p>
                    <button
                      onClick={() => setSelectedSection('schedules')}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Book Your First Ticket
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800">Ticket #{ticket.id}</h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{ticket.status}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-700"><strong className="text-gray-900">Route:</strong> {ticket.route.from} → {ticket.route.to}</p>
                          <p className="text-gray-700"><strong className="text-gray-900">Bus:</strong> {ticket.busNumber} ({ticket.agency})</p>
                          <p className="text-gray-700"><strong className="text-gray-900">Date:</strong> {ticket.date}</p>
                          <p className="text-gray-700"><strong className="text-gray-900">Time:</strong> {ticket.departure} - {ticket.arrival}</p>
                          <p className="text-gray-700"><strong className="text-gray-900">Seat:</strong> {ticket.seatNumber}</p>
                          <p className="text-gray-700"><strong className="text-gray-900">Price:</strong> {ticket.price} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Book Ticket</h2>
              
              {/* Trip Information */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-gray-800">{selectedSchedule.route.from} → {selectedSchedule.route.to}</p>
                <p className="text-sm text-gray-600">{selectedSchedule.busNumber} • {selectedSchedule.agency}</p>
                <p className="text-sm text-gray-600">{selectedSchedule.date} • {selectedSchedule.departure}</p>
                <p className="font-bold text-blue-600">{selectedSchedule.price} FCFA</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seat Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Your Seat</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {/* Bus Layout Header */}
                    <div className="text-center mb-4">
                      <div className="bg-gray-300 rounded p-2 mb-2">
                        <span className="text-sm font-medium text-gray-800">🚗 Driver</span>
                      </div>
                    </div>

                    {/* Seat Layout */}
                    <div className="space-y-2">
                      {generateSeatLayout(selectedSchedule.totalSeats, selectedSchedule.bookedSeats || []).map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center items-center gap-4">
                          {/* Left side seats */}
                          <div className="flex gap-1">
                            {row.filter(seat => seat.position === 'left').map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.isBooked}
                                className={`w-8 h-8 text-xs font-medium rounded ${
                                  seat.isBooked
                                    ? 'bg-red-300 text-red-800 cursor-not-allowed'
                                    : selectedSeat?.id === seat.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                                title={seat.isBooked ? 'Seat taken' : `Seat ${seat.id}`}
                              >
                                {seat.id}
                              </button>
                            ))}
                          </div>

                          {/* Aisle */}
                          <div className="w-4 text-center text-gray-400 text-xs">
                            ||
                          </div>

                          {/* Right side seats */}
                          <div className="flex gap-1">
                            {row.filter(seat => seat.position === 'right').map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.isBooked}
                                className={`w-8 h-8 text-xs font-medium rounded ${
                                  seat.isBooked
                                    ? 'bg-red-300 text-red-800 cursor-not-allowed'
                                    : selectedSeat?.id === seat.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                                title={seat.isBooked ? 'Seat taken' : `Seat ${seat.id}`}
                              >
                                {seat.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-blue-100 rounded"></div>
                        <span className="text-gray-700">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-gray-700">Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-300 rounded"></div>
                        <span className="text-gray-700">Taken</span>
                      </div>
                    </div>

                    {selectedSeat && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-green-800 font-medium">
                          Selected Seat: {selectedSeat.id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Passenger Information Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Passenger Information</h3>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <input
                      name="passengerName"
                      value={bookingForm.passengerName}
                      onChange={handleBookingFormChange}
                      required
                      placeholder="Passenger Name"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleBookingFormChange}
                      required
                      placeholder="Phone Number"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      name="specialRequests"
                      value={bookingForm.specialRequests}
                      onChange={handleBookingFormChange}
                      placeholder="Special Requests (Optional)"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg h-20 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2 text-gray-800">Booking Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700"><strong className="text-gray-900">Route:</strong> {selectedSchedule.route.from} → {selectedSchedule.route.to}</p>
                        <p className="text-gray-700"><strong className="text-gray-900">Date:</strong> {selectedSchedule.date}</p>
                        <p className="text-gray-700"><strong className="text-gray-900">Time:</strong> {selectedSchedule.departure}</p>
                        <p className="text-gray-700"><strong className="text-gray-900">Seat:</strong> {selectedSeat ? selectedSeat.id : 'Not selected'}</p>
                        <p className="text-gray-700"><strong className="text-gray-900">Price:</strong> {selectedSchedule.price} FCFA</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowBookingModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedSeat}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                          selectedSeat
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Book Ticket
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal with QR Code */}
      {showTicketModal && generatedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-96 max-w-90vw">
            <div className="text-center mb-6">
              <MdQrCode className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700">Ticket Booked Successfully!</h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-center mb-3 text-gray-800">Ticket #{generatedTicket.id}</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700"><strong className="text-gray-900">Passenger:</strong> {generatedTicket.passengerName}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Route:</strong> {generatedTicket.route.from} → {generatedTicket.route.to}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Bus:</strong> {generatedTicket.busNumber} ({generatedTicket.agency})</p>
                <p className="text-gray-700"><strong className="text-gray-900">Date:</strong> {generatedTicket.date}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Time:</strong> {generatedTicket.departure}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Seat:</strong> {generatedTicket.seatNumber}</p>
                <p className="text-gray-700"><strong className="text-gray-900">Price:</strong> {generatedTicket.price} FCFA</p>
              </div>
            </div>
            
            {qrCodeUrl && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">QR Code for verification:</p>
                <img src={qrCodeUrl} alt="Ticket QR Code" className="mx-auto border rounded" />
              </div>
            )}
            
            <button
              onClick={() => setShowTicketModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
