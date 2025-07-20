'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiCalendar, FiUsers, FiBell, FiLogOut, FiPlus, FiEdit, FiClock, FiMapPin, FiUser, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { MdDirectionsBus } from 'react-icons/md';

export default function AgentPage() {
  // Set default agent data with company info
  const [agent, setAgent] = useState({ 
    name: 'Agent User', 
    role: 'busagent',
    company: { name: 'Default Company' }
  });
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [schedules, setSchedules] = useState([
    { id: 1, busNumber: 'BUS-001', route: 'Douala - Yaounde', departure: '08:00', arrival: '13:00', date: '2024-06-15', status: 'scheduled' },
    { id: 2, busNumber: 'BUS-002', route: 'Yaounde - Bamenda', departure: '14:00', arrival: '18:00', date: '2024-06-15', status: 'in-progress' },
  ]);
  const [busDrivers, setBusDrivers] = useState([
    { id: 1, name: 'John Mbeki', email: 'john.mbeki@email.com', phone: '+237123456789', status: 'available', license: 'DL123456' },
    { id: 2, name: 'Marie Nkomo', email: 'marie.nkomo@email.com', phone: '+237987654321', status: 'on-trip', license: 'DL789012' },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Schedule Created', message: 'Schedule for BUS-001 has been created', time: '10:30 AM', type: 'info' },
    { id: 2, title: 'Driver Status Update', message: 'John Mbeki is now available', time: '09:15 AM', type: 'success' },
  ]);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    busId: '', // Changed from busNumber to busId
    driver: '', 
    route: '', 
    destination: '', 
    departure: '', 
    arrival: '', 
    agency: '',
    date: '',
    price: ''
  });
  
  // Add agencies state with company filtering
  const [agencies, setAgencies] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Add buses state
  const [buses, setBuses] = useState([]);
  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({
    busNumber: '', capacity: '', routeFrom: '', routeTo: '', departureTime: '', arrivalTime: '', price: '', status: 'active'
  });

  const router = useRouter();

  // Add authentication check for bus agents
  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'busagent' || parsed.role === 'agent') {
        setAgent(parsed);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Enhanced logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Fetch agencies and companies when component mounts
  useEffect(() => {
    fetchAgenciesAndCompanies();
  }, []);

  const fetchAgenciesAndCompanies = async () => {
    try {
      // Fetch companies
      const companiesResponse = await fetch('/api/admin/companies');
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      }

      // Fetch agencies
      const agenciesResponse = await fetch('/api/admin/agencies');
      if (agenciesResponse.ok) {
        const agenciesData = await agenciesResponse.json();
        setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
      }
    } catch (error) {
      console.error('Error fetching agencies and companies:', error);
    }
  };

  // Filter agencies by agent's company
  const getFilteredAgencies = () => {
    if (!agent.company || !agent.company.name) return [];
    
    return agencies.filter(agency => {
      // Check if agency belongs to the same company as the agent
      return agency.company?.name === agent.company.name || 
             agency.company === agent.company.name ||
             agency.company === agent.company._id;
    });
  };

  // Filter bus drivers by agent's company  
  const getFilteredBusDrivers = () => {
    if (!agent.company || !agent.company.name) return busDrivers;
    
    return busDrivers.filter(driver => {
      // Check if driver belongs to the same company as the agent
      return driver.company?.name === agent.company.name || 
             driver.company === agent.company.name ||
             driver.company === agent.company._id;
    });
  };

  // Filter buses by agent's company
  const getFilteredBuses = () => {
    if (!agent.company || !agent.company.name) return buses;
    
    return buses.filter(bus => {
      // Check if bus belongs to the same company as the agent
      return bus.company?.name === agent.company.name || 
             bus.company === agent.company.name ||
             bus.company === agent.company._id;
    });
  };

  const handleScheduleFormChange = (e) => {
    setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
  };

  const handleCreateSchedule = () => {
    setScheduleForm({ 
      busId: '', 
      driver: '', 
      route: '', 
      destination: '', 
      departure: '', 
      arrival: '', 
      agency: '',
      date: '',
      price: ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Find the selected bus details
    const selectedBus = getFilteredBuses().find(bus => (bus._id || bus.id) === scheduleForm.busId);
    
    if (!selectedBus) {
      alert('Please select a valid bus');
      return;
    }
    
    try {
      const scheduleData = {
        busNumber: selectedBus.busNumber,
        route: {
          from: scheduleForm.route,
          to: scheduleForm.destination
        },
        departureTime: scheduleForm.departure,
        arrivalTime: scheduleForm.arrival,
        date: scheduleForm.date,
        price: parseFloat(scheduleForm.price) || selectedBus.price,
        agency: scheduleForm.agency,
        totalSeats: parseInt(selectedBus.capacity),
        seatsAvailable: parseInt(selectedBus.capacity),
        bus: scheduleForm.busId,
        agent: agent.id || agent._id || 'default-agent',
        status: 'active'
      };

      console.log('Creating schedule with data:', scheduleData);

      const response = await fetch('/api/busagent/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(scheduleData)
      });

      const responseData = await response.json();
      console.log('API response:', responseData);

      if (response.ok) {
        console.log('Schedule created successfully:', responseData);
        
        // Update local state with the new schedule
        const scheduleForDisplay = {
          id: responseData._id || responseData.id,
          busNumber: responseData.busNumber,
          busId: scheduleForm.busId,
          driver: scheduleForm.driver,
          route: `${scheduleData.route.from} - ${scheduleData.route.to}`,
          destination: scheduleData.route.to,
          departure: scheduleData.departureTime,
          arrival: scheduleData.arrivalTime,
          agency: scheduleData.agency,
          date: scheduleData.date,
          price: scheduleData.price,
          status: 'scheduled',
          capacity: selectedBus.capacity,
          availableSeats: selectedBus.capacity
        };
        
        setSchedules([...schedules, scheduleForDisplay]);
        
        // Generate notifications for users and drivers
        await generateScheduleNotifications(scheduleForDisplay);
        
        alert('Schedule created successfully!');
      } else {
        console.error('Failed to create schedule:', responseData);
        alert(`Failed to create schedule: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Error creating schedule: ' + error.message);
    }
    
    setShowScheduleModal(false);
    setScheduleForm({ 
      busId: '', 
      driver: '', 
      route: '', 
      destination: '', 
      departure: '', 
      arrival: '', 
      agency: '',
      date: '',
      price: ''
    });
  };

  // Function to generate notifications when schedule is created
  const generateScheduleNotifications = async (schedule) => {
    try {
      // Notification for users
      const userNotification = {
        title: 'New Bus Schedule Available',
        message: `New trip from ${schedule.route} to ${schedule.destination} on ${schedule.departure} - ${schedule.arrival}`,
        targetRole: 'user',
        type: 'info'
      };

      // Notification for assigned driver
      const driverNotification = {
        title: 'New Schedule Assignment',
        message: `You have been assigned to bus ${schedule.busNumber} for route ${schedule.route} to ${schedule.destination}`,
        targetRole: 'driver',
        type: 'info'
      };

      // Add to local notifications state
      const newNotifications = [
        { id: Date.now(), ...userNotification, time: new Date().toLocaleTimeString() },
        { id: Date.now() + 1, ...driverNotification, time: new Date().toLocaleTimeString() }
      ];
      
      setNotifications(prev => [...newNotifications, ...prev]);

      // In a real app, you would send these to your API
      // await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify([userNotification, driverNotification])
      // });

      console.log('Notifications generated for schedule:', schedule.busNumber);
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  // Fetch buses from API when buses section is selected
  const fetchBuses = async () => {
    try {
      console.log('Fetching buses for agent:', agent.name, 'company:', agent.company?.name);
      
      const params = new URLSearchParams({
        agentId: agent.id || agent._id || 'agent-1',
        company: agent.company?.name || 'Default Company'
      });
      
      const response = await fetch(`/api/agent/buses?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched buses data:', data);
        setBuses(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch buses:', response.status, response.statusText);
        setBuses([]);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  // Bus management handlers
  const handleBusFormChange = (e) => {
    setBusForm({ ...busForm, [e.target.name]: e.target.value });
  };

  const handleAddBus = () => {
    setEditingBus(null);
    setBusForm({
      busNumber: '', capacity: '', routeFrom: '', routeTo: '', departureTime: '', arrivalTime: '', price: '', status: 'active'
    });
    setShowBusModal(true);
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      routeFrom: bus.route?.from || '',
      routeTo: bus.route?.to || '',
      departureTime: bus.schedule?.departure ? new Date(bus.schedule.departure).toTimeString().slice(0, 5) : '',
      arrivalTime: bus.schedule?.arrival ? new Date(bus.schedule.arrival).toTimeString().slice(0, 5) : '',
      price: bus.price,
      status: bus.status
    });
    setShowBusModal(true);
  };

  const handleBusFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting bus form:', busForm);
      console.log('Agent company:', agent.company);
      
      const busData = {
        busNumber: busForm.busNumber,
        capacity: parseInt(busForm.capacity),
        route: {
          from: busForm.routeFrom,
          to: busForm.routeTo
        },
        schedule: {
          departure: new Date(`2024-01-01T${busForm.departureTime}`),
          arrival: new Date(`2024-01-01T${busForm.arrivalTime}`)
        },
        price: parseFloat(busForm.price),
        status: busForm.status,
        // Automatically associate with agent's company
        company: agent.company?.name || agent.company || 'Default Company',
        agentId: agent.id || agent._id || 'agent-1'
      };
      
      console.log('Prepared bus data:', busData);

      const response = await fetch('/api/agent/buses', {
        method: editingBus ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBus ? { ...busData, id: editingBus._id } : busData)
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const savedBus = await response.json();
        console.log('Saved bus:', savedBus);
        
        // Immediately refresh the buses list
        await fetchBuses();
        
        setShowBusModal(false);
        
        // Reset form
        setBusForm({
          busNumber: '', capacity: '', routeFrom: '', routeTo: '', 
          departureTime: '', arrivalTime: '', price: '', status: 'active'
        });
        setEditingBus(null);
        
        alert(editingBus ? 'Bus updated successfully!' : 'Bus created successfully and associated with your company!');
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        alert(errorData.error || 'Failed to save bus');
      }
    } catch (error) {
      console.error('Error saving bus:', error);
      alert('Error saving bus: ' + error.message);
    }
  };

  const handleDeleteBus = async (id) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    
    try {
      const response = await fetch('/api/agent/buses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        fetchBuses();
      } else {
        alert('Failed to delete bus');
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
      alert('Error deleting bus');
    }
  };

  // Fetch schedules from database
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/busagent/schedules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched schedules:', data);
        
        // Transform database schedules to display format
        const transformedSchedules = data.map(schedule => ({
          id: schedule._id || schedule.id,
          busNumber: schedule.busNumber,
          route: `${schedule.route.from} - ${schedule.route.to}`,
          destination: schedule.route.to,
          departure: schedule.departureTime,
          arrival: schedule.arrivalTime,
          date: schedule.date,
          agency: schedule.agency,
          price: schedule.price,
          status: 'scheduled',
          driver: 'Not assigned' // You can enhance this later
        }));
        
        setSchedules(transformedSchedules);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Add missing handleDeleteSchedule function
  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      const response = await fetch('/api/busagent/schedules', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: scheduleId })
      });

      if (response.ok) {
        // Remove from local state
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        alert('Schedule deleted successfully!');
      } else {
        alert('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule');
    }
  };

  // Add missing handleUpdateDriverStatus function
  const handleUpdateDriverStatus = (driverId, newStatus) => {
    setBusDrivers(busDrivers.map(driver => 
      driver.id === driverId ? { ...driver, status: newStatus } : driver
    ));
  };

  // Load data when component mounts and when buses section is selected
  useEffect(() => {
    if (agent.name !== 'Agent User') { // Only fetch when real agent data is loaded
      fetchSchedules();
      if (selectedSection === 'buses') {
        fetchBuses();
      }
    }
  }, [agent, selectedSection]);

  // Remove loading check since agent is always set
  // if (!agent) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title animate-gradient-text">BusEase</span>
          <span className="sidebar-subtitle">Agent Panel</span>
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
            onClick={() => setSelectedSection('buses')}
            className={`sidebar-link ${selectedSection === 'buses' ? 'sidebar-link-active' : ''}`}
          >
            <FiTruck className="mr-3" /> Buses
          </button>
          <button
            onClick={() => setSelectedSection('busDrivers')}
            className={`sidebar-link ${selectedSection === 'busDrivers' ? 'sidebar-link-active' : ''}`}
          >
            <FiUsers className="mr-3" /> Bus Drivers
          </button>
          <button
            onClick={() => setSelectedSection('notifications')}
            className={`sidebar-link ${selectedSection === 'notifications' ? 'sidebar-link-active' : ''}`}
          >
            <FiBell className="mr-3" /> Notifications
          </button>
        </nav>
        <button
          onClick={handleLogout} // Logout button functionality
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
              BusEase Agent
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Display logged in agent's name and company */}
            <div className="text-right">
              <span className="text-gray-700 font-medium block">Welcome, {agent.name}</span>
              {agent.company && (
                <span className="text-gray-500 text-sm block">{agent.company.name}</span>
              )}
            </div>
            {/* Display agent's initial in avatar */}
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {agent.name.charAt(0).toUpperCase()}
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
                    {/* Personalized welcome message using agent's name */}
                    Welcome, {agent.name}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage schedules, monitor bus drivers, and handle notifications from your agent dashboard.
                  </p>
                  {agent.company && (
                    <p className="text-blue-600 font-medium mt-2">
                      {agent.company.name} - Agent Portal
                    </p>
                  )}
                </div>
                {/* Agent avatar display with company info */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow mx-auto mb-2">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  {agent.company && (
                    <p className="text-sm text-gray-500">{agent.company.name}</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Total Schedules</h3>
                  <p className="text-4xl font-bold text-blue-600">{schedules.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Total Buses</h3>
                  <p className="text-4xl font-bold text-purple-600">{buses.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Active Drivers</h3>
                  <p className="text-4xl font-bold text-green-600">{busDrivers.filter(d => d.status === 'available').length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Notifications</h3>
                  <p className="text-4xl font-bold text-red-600">{notifications.length}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Recent Schedules</h3>
                <div className="space-y-3">
                  {schedules.slice(0, 3).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MdDirectionsBus className="text-blue-500 text-xl" />
                        <div>
                          <p className="font-medium text-gray-800">{schedule.busNumber} - {schedule.route} to {schedule.destination}</p>
                          <p className="text-sm text-gray-600">Driver: {schedule.driver} • {schedule.departure} - {schedule.arrival}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        schedule.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedules Section */}
          {selectedSection === 'schedules' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Schedule Management</h1>
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={handleCreateSchedule}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
                  >
                    <FiPlus className="animate-bounce-slow" /> Create Schedule
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Bus Number</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Driver</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Route</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Destination</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Departure</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Arrival</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Agency</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Status</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule, idx) => (
                        <tr key={schedule.id} className="group hover:bg-blue-50 transition-all duration-200">
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-4 border-b font-medium text-gray-700">{schedule.busNumber}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.driver}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.route}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.destination}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.departure}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.arrival}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{schedule.agency}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              schedule.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {schedule.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <button
                                title="Edit"
                                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                              >
                                <FiEdit />
                              </button>
                              <button
                                title="Delete"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 hover:scale-110"
                              >
                                <FiLogOut />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create Schedule Modal */}
              {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-96 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Schedule</h2>
                    <form onSubmit={handleScheduleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Bus *
                        </label>
                        <select
                          name="busId"
                          value={scheduleForm.busId}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="" className="text-gray-500">Select Bus</option>
                          {getFilteredBuses().map((bus) => (
                            <option key={bus._id || bus.id} value={bus._id || bus.id} className="text-gray-900">
                              {bus.busNumber} - {bus.route?.from} to {bus.route?.to} (Capacity: {bus.capacity})
                            </option>
                          ))}
                        </select>
                        {getFilteredBuses().length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            No buses available for your company. Please add buses first.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Driver *
                        </label>
                        <select
                          name="driver"
                          value={scheduleForm.driver}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="" className="text-gray-500">Select Driver</option>
                          {getFilteredBusDrivers().map((driver) => (
                            <option key={driver.id} value={driver.name} className="text-gray-900">
                              {driver.name} - {driver.license} ({driver.status})
                            </option>
                          ))}
                        </select>
                        {getFilteredBusDrivers().length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            No drivers available for your company. Please add drivers first.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Route (From) *
                        </label>
                        <input
                          name="route"
                          value={scheduleForm.route}
                          onChange={handleScheduleFormChange}
                          required
                          placeholder="Route (e.g., Douala)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destination (To) *
                        </label>
                        <input
                          name="destination"
                          value={scheduleForm.destination}
                          onChange={handleScheduleFormChange}
                          required
                          placeholder="Destination (e.g., Yaounde)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          name="date"
                          type="date"
                          value={scheduleForm.date}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departure Time *
                        </label>
                        <input
                          name="departure"
                          type="time"
                          value={scheduleForm.departure}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arrival Time *
                        </label>
                        <input
                          name="arrival"
                          type="time"
                          value={scheduleForm.arrival}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agency *
                        </label>
                        <select
                          name="agency"
                          value={scheduleForm.agency}
                          onChange={handleScheduleFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="" className="text-gray-500">Select Agency</option>
                          {getFilteredAgencies().map((agency) => (
                            <option key={agency._id || agency.id} value={agency.name} className="text-gray-900">
                              {agency.name}
                            </option>
                          ))}
                        </select>
                        {getFilteredAgencies().length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            No agencies available for your company ({agent.company?.name}). Please contact admin to create agencies.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (FCFA) - Optional
                        </label>
                        <input
                          name="price"
                          type="number"
                          value={scheduleForm.price}
                          onChange={handleScheduleFormChange}
                          placeholder="Override bus default price"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to use bus default price
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={getFilteredBuses().length === 0 || getFilteredBusDrivers().length === 0 || getFilteredAgencies().length === 0}
                        >
                          Create Schedule
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buses Section */}
          {selectedSection === 'buses' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Bus Management</h1>
                
                {/* Debug info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-700">
                    <strong>Company:</strong> {agent.company?.name || 'Default Company'} | 
                    <strong> Total Buses:</strong> {buses.length}
                  </p>
                </div>
                
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={handleAddBus}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
                  >
                    <FiPlus className="animate-bounce-slow" /> Add Bus
                  </button>
                  <button
                    onClick={fetchBuses}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    <FiRefreshCw /> Refresh
                  </button>
                </div>
                
                {buses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <MdDirectionsBus className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No buses found for your company</p>
                    <button
                      onClick={handleAddBus}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Bus
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] bg-white rounded-xl shadow-lg border border-gray-200">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">#</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Bus Number</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Capacity</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Route</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Schedule</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Price</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Status</th>
                          <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buses.map((bus, idx) => (
                          <tr key={bus._id || idx} className="group hover:bg-blue-50 transition-all duration-200">
                            <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                            <td className="py-2 px-4 border-b font-medium text-gray-700">{bus.busNumber}</td>
                            <td className="py-2 px-4 border-b text-gray-700">{bus.capacity}</td>
                            <td className="py-2 px-4 border-b text-gray-700">
                              {bus.route?.from} - {bus.route?.to}
                            </td>
                            <td className="py-2 px-4 border-b text-gray-700 text-sm">
                              {bus.schedule?.departure && bus.schedule?.arrival ? (
                                `${new Date(bus.schedule.departure).toTimeString().slice(0, 5)} - ${new Date(bus.schedule.arrival).toTimeString().slice(0, 5)}`
                              ) : (
                                'Not set'
                              )}
                            </td>
                            <td className="py-2 px-4 border-b text-gray-700">{bus.price} FCFA</td>
                            <td className="py-2 px-4 border-b">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bus.status === 'active' ? 'bg-green-100 text-green-800' :
                                bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {bus.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 border-b">
                              <div className="flex gap-2">
                                <button
                                  title="Edit"
                                  onClick={() => handleEditBus(bus)}
                                  className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDeleteBus(bus._id)}
                                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 hover:scale-110"
                                >
                                  <FiLogOut />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add/Edit Bus Modal */}
              {showBusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-96 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      {editingBus ? 'Edit Bus' : 'Add New Bus'}
                    </h2>
                    
                    {/* Company info display */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-blue-700">
                        <strong>Company:</strong> {agent.company?.name || 'Default Company'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        This bus will be automatically associated with your company
                      </p>
                    </div>

                    <form onSubmit={handleBusFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bus Number *
                        </label>
                        <input
                          name="busNumber"
                          value={busForm.busNumber}
                          onChange={handleBusFormChange}
                          required
                          placeholder="Bus Number (e.g., BUS-001)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacity *
                        </label>
                        <input
                          name="capacity"
                          type="number"
                          value={busForm.capacity}
                          onChange={handleBusFormChange}
                          required
                          placeholder="Capacity (e.g., 50)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From *
                        </label>
                        <input
                          name="routeFrom"
                          value={busForm.routeFrom}
                          onChange={handleBusFormChange}
                          required
                          placeholder="From (e.g., Douala)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To *
                        </label>
                        <input
                          name="routeTo"
                          value={busForm.routeTo}
                          onChange={handleBusFormChange}
                          required
                          placeholder="To (e.g., Yaounde)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departure Time *
                        </label>
                        <input
                          name="departureTime"
                          type="time"
                          value={busForm.departureTime}
                          onChange={handleBusFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arrival Time *
                        </label>
                        <input
                          name="arrivalTime"
                          type="time"
                          value={busForm.arrivalTime}
                          onChange={handleBusFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (FCFA) *
                        </label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          value={busForm.price}
                          onChange={handleBusFormChange}
                          required
                          placeholder="Price (e.g., 5000)"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={busForm.status}
                          onChange={handleBusFormChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="active" className="text-gray-900">Active</option>
                          <option value="maintenance" className="text-gray-900">Maintenance</option>
                          <option value="inactive" className="text-gray-900">Inactive</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowBusModal(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {editingBus ? 'Update Bus' : 'Add Bus'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bus Drivers Section */}
          {selectedSection === 'busDrivers' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Bus Drivers</h1>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Name</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Email</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Phone</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">License</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Status</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {busDrivers.map((driver, idx) => (
                        <tr key={driver.id} className="group hover:bg-blue-50 transition-all duration-200">
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-4 border-b font-medium flex items-center gap-2 text-gray-700">
                            <span className="inline-block w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold">
                              {driver.name.charAt(0).toUpperCase()}
                            </span>
                            {driver.name}
                          </td>
                          <td className="py-2 px-4 border-b text-gray-700">{driver.email}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{driver.phone}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{driver.license}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              driver.status === 'available' ? 'bg-green-100 text-green-800' :
                              driver.status === 'on-trip' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {driver.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <select
                              value={driver.status}
                              onChange={(e) => handleUpdateDriverStatus(driver.id, e.target.value)}
                              className="px-2 py-1 rounded border text-sm"
                            >
                              <option value="available">Available</option>
                              <option value="on-trip">On Trip</option>
                              <option value="off-duty">Off Duty</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {selectedSection === 'notifications' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Notifications</h1>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <FiBell />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{notification.title}</h3>
                            <p className="text-gray-600 mb-2">{notification.message}</p>
                            <span className="text-sm text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}