'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiBriefcase, FiLayers, FiUserCheck, FiBell, FiEdit, FiBarChart2, FiRefreshCw, FiPlus, FiSearch, FiUser } from 'react-icons/fi';
import { MdDirectionsBus } from 'react-icons/md';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', email: '', address: '' });
  const [stats, setStats] = useState({ totalUsers: 0, totalTickets: 0, totalAmount: 0 });
  const [notifications, setNotifications] = useState([
    { id: 1, user: 'John Doe', message: 'Ticket purchased', date: '2024-06-01' },
    { id: 2, user: 'Jane Smith', message: 'Profile updated', date: '2024-06-02' },
  ]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ user: '', message: '' });
  const [agencies, setAgencies] = useState([
    { id: 1, name: 'Central Agency', company: 'Express Transit', locations: ['Douala', 'Buea'], createdAt: '2024-06-01' },
    { id: 2, name: 'West Agency', company: 'Rapid Bus', locations: ['Yaounde', 'Bamenda'], createdAt: '2024-06-02' },
  ]);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [agencyForm, setAgencyForm] = useState({ name: '', company: '', locations: '' });
  const [agencySearch, setAgencySearch] = useState('');
  const handleAgencySearch = (e) => {
    setAgencySearch(e.target.value);
  };

  const [profileInfo, setProfileInfo] = useState({ name: '', email: '', role: '' });
  const [profileFetched, setProfileFetched] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserTab, setCreateUserTab] = useState('busAgent');
  const [busAgentForm, setBusAgentForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [busDriverForm, setBusDriverForm] = useState({
    name: '', email: '', phone: '', licenseNumber: '', company: '', password: '', status: 'available'
  });
  const [admins, setAdmins] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [buses, setBuses] = useState([]);
  const [busDrivers, setBusDrivers] = useState([]);
  const [busAgents, setBusAgents] = useState([]);
  
  // Add these missing state variables for user management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'passenger'
  });
  const [userLoading, setUserLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'admin') {
        setAdmin(parsed);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Mock fetch for companies (replace with real API call)
  useEffect(() => {
    if (selectedSection === 'companies') {
      fetch('/api/admin/companies')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Fetched companies:', data);
          setCompanies(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error('Error fetching companies:', error);
          setCompanies([]);
        });
    }
  }, [selectedSection]);

  // Mock fetch for statistics (replace with real API call)
  useEffect(() => {
    if (selectedSection === 'statistics') {
      setTimeout(() => {
        setStats({ totalUsers: 120, totalTickets: 340, totalAmount: 850000 });
      });
    }
  }, [selectedSection]);

  // Fetch users from backend API when 'users' section is selected
  useEffect(() => {
    if (selectedSection === 'users') {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => {
          console.log('Fetched users:', data); // Add this line
          if (Array.isArray(data)) setUsers(data);
          else if (data && Array.isArray(data.users)) setUsers(data.users);
          else setUsers([]);
        })
        .catch((err) => {
          console.error('Error fetching users:', err); // Add this line
          setUsers([]);
        });
    }
  }, [selectedSection]);

  // Fetch admins from API when 'admins' section is selected
  useEffect(() => {
    if (selectedSection === 'admins') {
      fetch('/api/admin/admins')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAdmins(data);
          else if (data && Array.isArray(data.admins)) setAdmins(data.admins);
          else setAdmins([]);
        })
        .catch(() => setAdmins([]));
    }
  }, [selectedSection]);

  // Fetch buses from API when 'buses' section is selected
  useEffect(() => {
    // Replace with your real API endpoint
    fetch('/api/admin/buses')
      .then(res => res.json())
      .then(data => setBuses(Array.isArray(data) ? data : []))
      .catch(() => setBuses([]));
  }, []);

  // Add this useEffect to fetch agencies from backend
  useEffect(() => {
    if (selectedSection === 'agencies') {
      console.log('Fetching agencies...');
      fetch('/api/admin/agencies')
        .then(res => {
          console.log('Agency fetch response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Fetched agencies data:', data);
          setAgencies(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error('Error fetching agencies:', error);
          setAgencies([]);
        });
    }
  }, [selectedSection]);

  const [showBusDriverModal, setShowBusDriverModal] = useState(false);
  const [editingBusDriver, setEditingBusDriver] = useState(null);
  const handleAddBusDriver = () => {
    setEditingBusDriver(null);
    setBusDriverForm({
      name: '', email: '', phone: '', licenseNumber: '', company: '', password: '', status: 'available'
    });
    setShowBusDriverModal(true);
  };
  // Fetch bus drivers when section is selected
  useEffect(() => {
    if (selectedSection === 'busDrivers') {
      fetch('/api/admin/busdrivers')
        .then(res => res.json())
        .then(data => setBusDrivers(Array.isArray(data) ? data : []))
        .catch(() => setBusDrivers([]));
    }
  }, [selectedSection]);

  // Fetch bus agents when section is selected
  useEffect(() => {
    if (selectedSection === 'busAgents') {
      fetch('/api/admin/bus-agents')
        .then(res => res.json())
        .then(data => setBusAgents(Array.isArray(data) ? data : []))
        .catch(() => setBusAgents([]));
    }
  }, [selectedSection]);

  // Add these new state variables for bus agent management
  const [showBusAgentModal, setShowBusAgentModal] = useState(false);
  const [editingBusAgent, setEditingBusAgent] = useState(null);
  const [busAgentLoading, setBusAgentLoading] = useState(false);

  // Fetch profile info on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfileInfo(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (admin) {
      fetchProfile();
    }
  }, [admin]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleCompanyFormChange = (e) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({ name: '', email: '', address: '' });
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setCompanyForm({ 
      name: company.name || '', 
      email: company.email || '', 
      address: company.address || '' 
    });
    setShowCompanyModal(true);
  };

  const [companyDeleteLoading, setCompanyDeleteLoading] = useState(false);

  const handleDeleteCompany = async (id) => {
    if (!id) {
      alert('Invalid company ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }
    
    setCompanyDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete company' }));
        throw new Error(errorData.error || 'Failed to delete company');
      }
      
      // Remove company from local state immediately
      setCompanies(companies.filter(c => (c._id || c.id) !== id));
      alert('Company deleted successfully!');
    } catch (err) {
      console.error('Error deleting company:', err);
      alert(err.message || 'Error deleting company');
    }
    setCompanyDeleteLoading(false);
  };

  const handleCompanyFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        // Update company (PUT) - use both _id and id for compatibility
        const companyId = editingCompany._id || editingCompany.id;
        const response = await fetch(`/api/admin/companies/${companyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyForm),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to update company' }));
          throw new Error(errorData.error || 'Failed to update company');
        }
        
        const updatedCompany = await response.json();
        
        // Update local state with the updated company
        setCompanies(companies.map(c => 
          (c._id || c.id) === companyId ? updatedCompany : c
        ));
        
        alert('Company updated successfully!');
      } else {
        // Create company (POST)
        const response = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyForm),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to create company' }));
          throw new Error(errorData.error || 'Failed to create company');
        }
        
        const newCompany = await response.json();
        
        // Add new company to local state
        setCompanies([...companies, newCompany]);
        
        alert('Company created successfully!');
      }
      
      setShowCompanyModal(false);
      setEditingCompany(null);
      setCompanyForm({ name: '', email: '', address: '' });
    } catch (error) {
      console.error('Error saving company:', error);
      alert(error.message || 'Failed to save company');
    }
  };

  const handleNotificationFormChange = (e) => {
    setNotificationForm({ ...notificationForm, [e.target.name]: e.target.value });
  };
  const handleAddNotification = () => {
    setNotificationForm({ user: '', message: '' });
    setShowNotificationModal(true);
  };
  const handleNotificationFormSubmit = (e) => {
    e.preventDefault();
    setNotifications([
      ...notifications,
      { id: Date.now(), ...notificationForm, date: new Date().toISOString().slice(0, 10) },
    ]);
    setShowNotificationModal(false);
  };

  const handleAgencyFormChange = (e) => {
    setAgencyForm({ ...agencyForm, [e.target.name]: e.target.value });
  };
  const handleAddAgency = () => {
    setAgencyForm({ name: '', company: '', locations: '' });
    setShowAgencyModal(true);
  };
  const handleAgencyFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAgency) {
        // Update agency (PUT)
        const agencyId = editingAgency._id || editingAgency.id;
        const response = await fetch(`/api/admin/agencies/${agencyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...agencyForm,
            locations: (agencyForm.locations || '').split(',').map(l => l.trim()).filter(l => l),
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update agency');
        }
        
        const updatedAgency = await response.json();
        
        // Update local state
        setAgencies(agencies.map(a => 
          (a._id || a.id) === agencyId ? updatedAgency : a
        ));
        
        alert('Agency updated successfully!');
      } else {
        // Create agency (POST)
        const response = await fetch('/api/admin/agencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...agencyForm,
            locations: (agencyForm.locations || '').split(',').map(l => l.trim()).filter(l => l),
            createdAt: new Date().toISOString().slice(0, 10),
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create agency');
        }
        
        const newAgency = await response.json();
        
        // Add to local state
        setAgencies([...agencies, newAgency]);
        
        alert('Agency created successfully!');
      }
      
      setShowAgencyModal(false);
      setEditingAgency(null);
      setAgencyForm({ name: '', company: '', locations: '' });
    } catch (error) {
      console.error('Error saving agency:', error);
      alert(error.message || 'Failed to save agency');
    }
  };

  const handleEditAgency = (agency) => {
    setEditingAgency(agency);
    setAgencyForm({
      name: agency.name || '',
      company: agency.company?._id || agency.company?.id || agency.company || '',
      locations: Array.isArray(agency.locations) ? agency.locations.join(', ') : (agency.locations || ''),
    });
    setShowAgencyModal(true);
  };

  const handleDeleteAgency = async (id) => {
    if (!id) {
      alert('Invalid agency ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this agency?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/agencies/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete agency' }));
        throw new Error(errorData.error || 'Failed to delete agency');
      }
      
      // Remove agency from local state
      setAgencies(agencies.filter(a => (a._id || a.id) !== id));
      alert('Agency deleted successfully!');
    } catch (error) {
      console.error('Error deleting agency:', error);
      alert(error.message || 'Failed to delete agency');
    }
  };

  const handleFetchProfile = () => {
    // Simulate fetching admin info
    setProfileInfo({ name: admin.name, email: admin.email || 'admin@example.com', role: admin.role });
    setProfileFetched(true);
  };

  // Handlers for create user modal
  const handleCreateUserTab = (tab) => setCreateUserTab(tab);
  // const handleBusAgentFormChange = (e) => setBusAgentForm({ ...busAgentForm, [e.target.name]: e.target.value });
  const handleBusDriverFormChange = (e) => {
    setBusDriverForm({ ...busDriverForm, [e.target.name]: e.target.value });
  };

  const handleCreateBusAgent = async (e) => {
    e.preventDefault();
    // TODO: Call API to create bus agent
    setShowCreateUserModal(false);
    setBusAgentForm({ name: '', email: '', phone: '', company: '' });
  };

  const handleCreateBusDriver = async (e) => {
    e.preventDefault();
    // TODO: Call API to create bus driver
    setShowCreateUserModal(false);
    setBusDriverForm({ name: '', email: '', phone: '', licenseNumber: '' });
  };

  // // Update and Delete handlers for users
  // const handleEditUser = (user) => {
  //   // TODO: Implement edit user logic/modal
  //   alert(`Edit user: ${user.name}`);
  // };
  // const handleDeleteUser = (userId) => {
  //   // TODO: Implement delete user logic/API call
  //   setUsers(users.filter(u => u.id !== userId));
  // };

  // Admins management handlers
  const handleAdminFormChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({ name: '', email: '', password: '' });
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({ name: admin.name, email: admin.email, password: '' });
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = async (id) => {
    await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
    setAdmins(admins.filter(a => a.id !== id));
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    if (editingAdmin) {
      // Update
      await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      setAdmins(admins.map(a => a.id === editingAdmin.id ? { ...a, ...adminForm, password: undefined } : a));
    } else {
      // Create
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      const newAdmin = await res.json();
      setAdmins([...admins, newAdmin]);
    }
    setShowAdminModal(false);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // TODO: Add your API call or update logic here
    alert('Profile updated!');
  };

  // Add user form handlers
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'passenger'
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      role: user.role || 'passenger'
    });
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${editingUser._id || editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        const updatedUser = await response.json();
        
        // Update users list
        setUsers(users.map(u => 
          (u._id || u.id) === (editingUser._id || editingUser.id) 
            ? { ...updatedUser, password: undefined } 
            : u
        ));
        
        alert('User updated successfully!');
      } else {
        // Create new user
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create user');
        }

        const newUser = await response.json();
        setUsers([...users, { ...newUser, password: undefined }]);
        alert('User created successfully!');
      }

      setShowUserModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'passenger'
      });
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to save user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      alert('Invalid user ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from the list
      setUsers(users.filter(u => (u._id || u.id) !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Add missing editingAgency state variable
  const [editingAgency, setEditingAgency] = useState(null);

  // Add missing bus driver handlers
  const handleEditBusDriver = (driver) => {
    setEditingBusDriver(driver);
    setBusDriverForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      company: driver.company || '',
      password: '',
      status: driver.status || 'available'
    });
    setShowBusDriverModal(true);
  };

  const handleDeleteBusDriver = async (driverId) => {
    if (!driverId) {
      alert('Invalid driver ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/busdrivers/${driverId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }

      setBusDrivers(busDrivers.filter(d => (d._id || d.id) !== driverId));
      alert('Driver deleted successfully!');
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver');
    }
  };

  const handleBusDriverFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBusDriver) {
        // Update existing driver
        const response = await fetch(`/api/admin/busdrivers/${editingBusDriver._id || editingBusDriver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(busDriverForm)
        });

        if (!response.ok) {
          throw new Error('Failed to update driver');
        }

        const updatedDriver = await response.json();
        setBusDrivers(busDrivers.map(d => 
          (d._id || d.id) === (editingBusDriver._id || editingBusDriver.id) ? updatedDriver : d
        ));
        
        alert('Driver updated successfully!');
      } else {
        // Create new driver
        const response = await fetch('/api/admin/busdrivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(busDriverForm)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create driver');
        }

        const newDriver = await response.json();
        setBusDrivers([...busDrivers, newDriver]);
        alert('Driver created successfully!');
      }

      setShowBusDriverModal(false);
      setEditingBusDriver(null);
      setBusDriverForm({
        name: '', email: '', phone: '', licenseNumber: '', company: '', password: '', status: 'available'
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      alert(error.message || 'Failed to save driver');
    }
  };

  // Bus Agent management handlers
  const handleBusAgentFormChange = (e) => setBusAgentForm({ ...busAgentForm, [e.target.name]: e.target.value });

  const handleAddBusAgent = () => {
    setEditingBusAgent(null);
    setBusAgentForm({ name: '', email: '', phone: '', company: '', password: '' });
    setShowBusAgentModal(true);
  };

  const handleEditBusAgent = (agent) => {
    setEditingBusAgent(agent);
    setBusAgentForm({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      company: agent.company || '',
      password: '' // Don't populate password for security
    });
    setShowBusAgentModal(true);
  };

  const handleDeleteBusAgent = async (agentId) => {
    if (!agentId) {
      alert('Invalid bus agent ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this bus agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bus-agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete bus agent');
      }

      setBusAgents(busAgents.filter(a => (a._id || a.id) !== agentId));
      alert('Bus agent deleted successfully!');
    } catch (error) {
      console.error('Error deleting bus agent:', error);
      alert('Failed to delete bus agent');
    }
  };

  const handleBusAgentFormSubmit = async (e) => {
    e.preventDefault();
    setBusAgentLoading(true);

    try {
      if (editingBusAgent) {
        // Update existing bus agent
        const response = await fetch(`/api/admin/bus-agents/${editingBusAgent._id || editingBusAgent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(busAgentForm)
        });

        if (!response.ok) {
          throw new Error('Failed to update bus agent');
        }

        const updatedAgent = await response.json();
        setBusAgents(busAgents.map(a => 
          (a._id || a.id) === (editingBusAgent._id || editingBusAgent.id) ? updatedAgent : a
        ));
        
        alert('Bus agent updated successfully!');
      } else {
        // Create new bus agent
        const response = await fetch('/api/admin/bus-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...busAgentForm,
            password: busAgentForm.password || 'defaultPassword123' // Use provided password or default
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create bus agent');
        }

        const newAgent = await response.json();
        setBusAgents([...busAgents, newAgent]);
        alert('Bus agent created successfully!');
      }

      setShowBusAgentModal(false);
      setEditingBusAgent(null);
      setBusAgentForm({ name: '', email: '', phone: '', company: '', password: '' });
    } catch (error) {
      console.error('Error saving bus agent:', error);
      alert(error.message || 'Failed to save bus agent');
    } finally {
      setBusAgentLoading(false);
    }
  };

  const userCount = users.length;
  const busAgentCount = users.filter(u => u.role === 'busAgent').length;
  const busDriverCount = users.filter(u => u.role === 'busDriver').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const companyCount = companies.length;
  const agencyCount = agencies.length;
  const busCount = buses.length;

  const chartData = {
    labels: ['Users', 'Bus Agents', 'Bus Drivers', 'Admins', 'Companies', 'Agencies', 'Buses'],
    datasets: [
      {
        label: 'Count',
data: [userCount, busAgentCount, busDriverCount, adminCount, companyCount, agencyCount, busCount],
       backgroundColor: [
          '#2563eb', // blue
          '#22c55e', // green
          '#a21caf', // purple
          '#f59e42', // orange
          '#0ea5e9', // sky
          '#f43f5e', // red
          '#fbbf24', // yellow
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#000' } },
      x: { ticks: { color: '#000' } },
    },
  };

  if (!admin) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title animate-gradient-text">BusEase</span>
          <span className="sidebar-subtitle">Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => setSelectedSection('dashboard')}
            className={`sidebar-link ${selectedSection === 'dashboard' ? 'sidebar-link-active' : ''}`}
          >
            <FiHome className="mr-3" /> Dashboard
          </button>
          <button
            onClick={() => setSelectedSection('users')}
            className={`sidebar-link ${selectedSection === 'users' ? 'sidebar-link-active' : ''}`}
          >
            <FiUsers className="mr-3" /> Users
          </button>
          <button
            onClick={() => setSelectedSection('companies')}
            className={`sidebar-link ${selectedSection === 'companies' ? 'sidebar-link-active' : ''}`}
          >
            <FiBriefcase className="mr-3" /> Companies
          </button>
          <button
            onClick={() => setSelectedSection('agencies')}
            className={`sidebar-link ${selectedSection === 'agencies' ? 'sidebar-link-active' : ''}`}
          >
            <FiLayers className="mr-3" /> Agencies
          </button>
          <button
            onClick={() => setSelectedSection('busDrivers')}
            className={`sidebar-link ${selectedSection === 'busDrivers' ? 'sidebar-link-active' : ''}`}
          >
            <FiUserCheck className="mr-3" /> Bus Drivers
          </button>
          <button
            onClick={() => setSelectedSection('busAgents')}
            className={`sidebar-link ${selectedSection === 'busAgents' ? 'sidebar-link-active' : ''}`}
          >
            <FiUsers className="mr-3" /> Bus Agents
          </button>
          <button
            onClick={() => setSelectedSection('notifications')}
            className={`sidebar-link ${selectedSection === 'notifications' ? 'sidebar-link-active' : ''}`}
          >
            <FiBell className="mr-3" /> Notifications
          </button>
          <button
            onClick={() => setSelectedSection('updateProfile')}
            className={`sidebar-link ${selectedSection === 'updateProfile' ? 'sidebar-link-active' : ''}`}
          >
            <FiEdit className="mr-3" /> Update Profile
          </button>
          <Link
            href="/dashboard/admin/buses"
            className="sidebar-link"
          >
            <MdDirectionsBus className="mr-3" /> Buses
          </Link>
          <Link
            href="/dashboard/admin/settings"
            className="sidebar-link"
          >
            <FiSettings className="mr-3" /> Settings
          </Link>
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
              BusEase
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Welcome, {admin.name}</span>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {admin.name.charAt(0).toUpperCase()}
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
                    Welcome, {admin.name}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage your users, companies, agencies, and more from your professional dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Total Users</h3>
                  <p className="text-4xl font-bold text-black">{userCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Bus Agents</h3>
                  <p className="text-4xl font-bold text-black">{busAgentCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Bus Drivers</h3>
                  <p className="text-4xl font-bold text-black">{busDriverCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Admins</h3>
                  <p className="text-4xl font-bold text-black">{adminCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Companies</h3>
                  <p className="text-4xl font-bold text-black">{companyCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Agencies</h3>
                  <p className="text-4xl font-bold text-black">{agencyCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition">
                  <h3 className="text-lg font-semibold text-black mb-2">Buses</h3>
                  <p className="text-4xl font-bold text-black">{busCount}</p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center mt-6">
                <h3 className="text-lg font-semibold text-black mb-4">System Statistics</h3>
                <div className="w-full h-80 flex items-center justify-center">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
          {/* Users Management Section */}
          {selectedSection === 'users' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Users Management</h1>
                <div className="flex space-x-4 mb-4" >
                  <button
                    className="bg-blue-600 text-gray px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
                    onClick={handleAddUser}
                  >
                    <FiUsers className="animate-bounce-slow" /> Add User
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiBarChart2 /> Export
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiRefreshCw /> Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-12">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-48">Name</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-64">Email</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-32">Role</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr
                          key={user.id || user._id || idx}
                          className="transition-all duration-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.01] cursor-pointer group"
                          style={{ animation: `fadeInUp 0.3s ease ${(idx + 1) * 0.05}s both` }}
                        >
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-4 border-b font-medium flex items-center gap-2 text-gray-600 group-hover:text-blue-700">
                            <span className="inline-block w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold animate-fade-in">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                            {user.name}
                          </td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{user.email}</td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700 capitalize">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'busdriver' ? 'bg-green-100 text-green-800' :
                              user.role === 'busagent' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role || 'passenger'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <button
                                title="Edit User"
                                onClick={() => handleEditUser(user)}
                                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-all duration-200 hover:scale-110"
                              >
                                <FiEdit />
                              </button>
                              <button
                                title="Delete User"
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:scale-110"
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
              
              {/* User Modal */}
              {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-blue-700">
                        {editingUser ? 'Edit User' : 'Create New User'}
                      </h2>
                      <button
                        onClick={() => setShowUserModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleUserFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          name="name"
                          value={userForm.name}
                          onChange={handleUserFormChange}
                          required
                          placeholder="Enter full name"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={userForm.email}
                          onChange={handleUserFormChange}
                          required
                          placeholder="Enter email address"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password {editingUser ? '(leave blank to keep current)' : '*'}
                        </label>
                        <input
                          name="password"
                          type="password"
                          value={userForm.password}
                          onChange={handleUserFormChange}
                          required={!editingUser}
                          placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <select
                          name="role"
                          value={userForm.role}
                          onChange={handleUserFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="passenger">Passenger</option>
                          <option value="busdriver">Bus Driver</option>
                          <option value="busagent">Bus Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowUserModal(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          disabled={userLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={userLoading}
                        >
                          {userLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              {editingUser ? 'Updating...' : 'Creating...'}
                            </span>
                          ) : (
                            editingUser ? 'Update User' : 'Create User'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Companies Management Section */}
          {selectedSection === 'companies' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold mb-6 text-blue-700">Companies Management</h1>
                <div className="flex space-x-4 mb-4">
                  <button onClick={handleAddCompany} className="bg-blue-600 text-gray-200 px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold">
                    <FiBriefcase className="animate-bounce-slow" /> <span className="text-gray-200 ">Add Company</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">Name</th>
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">Email</th>
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">Address</th>
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">Created</th>
                        <th className="py-3 px-4 border-b font-semibold text-blue-700 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company, idx) => (
                        <tr key={company.id || company._id || idx} className="transition-all duration-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.01] cursor-pointer group">
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-4 border-b font-medium group-hover:text-blue-800 text-gray-800">{company.name}</td>
                          <td className="py-2 px-4 border-b group-hover:text-blue-800 text-gray-700">
        {company.email || <span className="text-gray-400 italic">No email</span>}
      </td>
                          <td className="py-2 px-4 border-b group-hover:text-blue-800 text-gray-700">
        {company.address || <span className="text-gray-400 italic">No address</span>}
      </td>
                          <td className="py-2 px-4 border-b group-hover:text-blue-800 text-gray-600">{company.createdAt}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <button
                                title="Edit"
                                onClick={() => handleEditCompany(company)}
                                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                              >
                                <FiEdit />
                              </button>
                              <button
                                title="Delete"
                                onClick={() => handleDeleteCompany(company.id || company._id)}
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 hover:scale-110"
                              >
                                {companyDeleteLoading ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <FiLogOut />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Modal for Add/Edit Company */}
              {showCompanyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                    <h2 className="text-xl font-bold mb-4 text-blue-700">{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
                    <form onSubmit={handleCompanyFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input 
                          name="name" 
                          value={companyForm.name} 
                          onChange={handleCompanyFormChange} 
                          required 
                          placeholder="Enter company name" 
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input 
                          name="email" 
                          type="email"
                          value={companyForm.email} 
                          onChange={handleCompanyFormChange} 
                          required 
                          placeholder="Enter email address" 
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <textarea 
                          name="address" 
                          value={companyForm.address} 
                          onChange={handleCompanyFormChange} 
                          required 
                          placeholder="Enter company address" 
                          rows="3"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowCompanyModal(false);
                            setEditingCompany(null);
                            setCompanyForm({ name: '', email: '', address: '' });
                          }} 
                          className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {editingCompany ? 'Update Company' : 'Add Company'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Agencies Management Section */}
          {selectedSection === 'agencies' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold mb-6 text-blue-500">Agencies Management</h1>
                <div className="flex space-x-4 mb-4 items-center">
                  <button onClick={handleAddAgency} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiLayers className="animate-bounce-slow" /> Add Agency
                  </button>
                  <div className="flex items-center border rounded px-2 py-1 bg-white ml-4">
                    <FiSearch className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search agencies..."
                      value={agencySearch}
                      onChange={handleAgencySearch}
                      className="outline-none bg-transparent text-gray-900"
                    />
                  </div>
                </div>
                
                {/* Debug info */}
                {agencies.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      No agencies found. Total agencies: {agencies.length}
                    </p>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Name</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Company</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Locations</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Created</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies
                        .filter(a => a.name?.toLowerCase().includes(agencySearch.toLowerCase()))
                        .map((agency, idx) => {
                          console.log('Rendering agency:', agency);
                          console.log('Agency locations:', agency.locations);
                          
                          return (
                            <tr key={agency._id || agency.id || idx} className="transition-all duration-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.01] cursor-pointer group">
                              <td className="py-2 px-4 border-b text-gray-700">{idx + 1}</td>
                              <td className="py-2 px-4 border-b text-gray-600 font-medium group-hover:text-blue-700">{agency.name}</td>
                              <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">
                                {agency.company?.name || agency.company || <span className="text-gray-400 italic">No company</span>}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">
                                {console.log('Checking locations for agency:', agency.name, 'Locations:', agency.locations)}
                                {Array.isArray(agency.locations) && agency.locations.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {agency.locations.map((location, locIdx) => (
                                      <span key={locIdx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {location}
                                      </span>
                                    ))}
                                  </div>
                                ) : agency.locations && typeof agency.locations === 'string' ? (
                                  <span className="text-gray-700">{agency.locations}</span>
                                ) : (
                                  <span className="text-gray-400 italic">No locations</span>
                                )}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{agency.createdAt}</td>
                              <td className="py-2 px-4 border-b">
                                <div className="flex gap-2">
                                  <button
                                    title="Edit"
                                    onClick={() => handleEditAgency(agency)}
                                    className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                                  >
                                    <FiEdit />
                                  </button>
                                  <button
                                    title="Delete"
                                    onClick={() => handleDeleteAgency(agency._id || agency.id)}
                                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 hover:scale-110"
                                  >
                                    <FiLogOut />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Modal for Add/Edit Agency */}
              {showAgencyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">
                      {editingAgency ? 'Edit Agency' : 'Add Agency'}
                    </h2>
                    <form onSubmit={handleAgencyFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agency Name *
                        </label>
                        <input 
                          name="name" 
                          value={agencyForm.name} 
                          onChange={handleAgencyFormChange} 
                          required 
                          placeholder="Enter agency name" 
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <select
                          name="company"
                          value={agencyForm.company}
                          onChange={handleAgencyFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Company</option>
                          {companies.length > 0 ? companies.map((company) => (
                            <option key={company._id || company.id} value={company._id || company.id}>
                              {company.name}
                            </option>
                          )) : (
                            <option value="" disabled>No companies available</option>
                          )}
                        </select>
                        {companies.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            No companies found. Please create companies first.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Locations * (comma separated)
                        </label>
                        <input
                          name="locations"
                          value={agencyForm.locations}
                          onChange={handleAgencyFormChange}
                          required
                          placeholder="e.g., Douala, Yaounde, Bamenda"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter multiple locations separated by commas</p>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAgencyModal(false);
                            setEditingAgency(null);
                            setAgencyForm({ name: '', company: '', locations: '' });
                          }} 
                          className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {editingAgency ? 'Update Agency' : 'Add Agency'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Bus Drivers Management Section */}
          {selectedSection === 'busDrivers' && (
  <div className="flex animate-fade-in">
    <div className="flex flex-col w-full">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Bus Drivers Management</h1>
      <div className="flex space-x-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
          onClick={handleAddBusDriver}
        >
          <FiUserCheck className="animate-bounce-slow" /> Add Bus Driver
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] bg-white rounded-xl shadow-lg border border-gray-200">
          <thead>
            <tr className="bg-blue-50">
              <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-12">#</th>
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
              <tr key={driver._id || idx} className="group hover:bg-blue-50">
                <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                <td className="py-2 px-4 border-b text-gray-700">{driver.name}</td>
                <td className="py-2 px-4 border-b text-gray-700">{driver.email}</td>
                <td className="py-2 px-4 border-b text-gray-700">{driver.phone}</td>
                <td className="py-2 px-4 border-b text-gray-700">{driver.licenseNumber}</td>
                <td className="py-2 px-4 border-b text-gray-700">{driver.status}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex gap-2">
                    <button
                      title="Edit"
                      onClick={() => handleEditBusDriver(driver)}
                      className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                    >
                      <FiEdit />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteBusDriver(driver._id)}
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
    {/* Modal for Add/Edit Bus Driver */}
    {showBusDriverModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-96">
          <h2 className="text-xl font-bold mb-4 text-blue-700">{editingBusDriver ? 'Edit Bus Driver' : 'Add Bus Driver'}</h2>
          <form onSubmit={handleBusDriverFormSubmit} className="space-y-4">
            <input 
              name="name" 
              value={busDriverForm.name} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="Name" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              name="email" 
              value={busDriverForm.email} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="Email" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              name="phone" 
              value={busDriverForm.phone} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="Phone" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              name="licenseNumber" 
              value={busDriverForm.licenseNumber} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="License Number" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              name="company" 
              value={busDriverForm.company} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="Company" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <input 
              name="password" 
              value={busDriverForm.password} 
              onChange={handleBusDriverFormChange} 
              required 
              placeholder="Password" 
              type="password" 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <select 
              name="status" 
              value={busDriverForm.status} 
              onChange={handleBusDriverFormChange} 
              className="w-full border px-3 py-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowBusDriverModal(false)} className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingBusDriver ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)}
          {/* Bus Agents Management Section */}
          {selectedSection === 'busAgents' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Bus Agents Management</h1>
                <div className="flex space-x-4 mb-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
                    onClick={handleAddBusAgent}
                  >
                    <FiUsers className="animate-bounce-slow" /> Add Bus Agent
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiBarChart2 /> Export
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiRefreshCw /> Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-12">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-48">Name</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-64">Email</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-32">Phone</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-32">Company</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {busAgents.map((agent, idx) => (
                        <tr
                          key={agent.id || agent._id || idx}
                          className="transition-all duration-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.01] cursor-pointer group"
                          style={{ animation: `fadeInUp 0.3s ease ${(idx + 1) * 0.05}s both` }}
                        >
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-4 border-b font-medium flex items-center gap-2 text-gray-600 group-hover:text-blue-700">
                            <span className="inline-block w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold animate-fade-in">
                              {agent.name?.charAt(0).toUpperCase()}
                            </span>
                            {agent.name}
                          </td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{agent.email}</td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{agent.phone}</td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">
                            {agent.company?.name || agent.company || <span className="text-gray-400 italic">No company</span>}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <button
                                title="Edit Bus Agent"
                                onClick={() => handleEditBusAgent(agent)}
                                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-all duration-200 hover:scale-110"
                              >
                                <FiEdit />
                              </button>
                              <button
                                title="Delete Bus Agent"
                                onClick={() => handleDeleteBusAgent(agent._id || agent.id)}
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:scale-110"
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
              
              {/* Bus Agent Modal */}
              {showBusAgentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-blue-700">
                        {editingBusAgent ? 'Edit Bus Agent' : 'Create New Bus Agent'}
                      </h2>
                      <button
                        onClick={() => setShowBusAgentModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleBusAgentFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          name="name"
                          value={busAgentForm.name}
                          onChange={handleBusAgentFormChange}
                          required
                          placeholder="Enter full name"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={busAgentForm.email}
                          onChange={handleBusAgentFormChange}
                          required
                          placeholder="Enter email address"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={busAgentForm.phone}
                          onChange={handleBusAgentFormChange}
                          required
                          placeholder="Enter phone number"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password {editingBusAgent ? '(leave blank to keep current)' : '*'}
                        </label>
                        <input
                          name="password"
                          type="password"
                          value={busAgentForm.password || ''}
                          onChange={handleBusAgentFormChange}
                          required={!editingBusAgent}
                          placeholder={editingBusAgent ? "Enter new password (optional)" : "Enter password"}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <select
                          name="company"
                          value={busAgentForm.company}
                          onChange={handleBusAgentFormChange}
                          required
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        >
                          <option value="">Select Company</option>
                          {companies.map((company) => (
                            <option key={company._id || company.id} value={company._id || company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowBusAgentModal(false)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          disabled={busAgentLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={busAgentLoading}
                        >
                          {busAgentLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              {editingBusAgent ? 'Updating...' : 'Creating...'}
                            </span>
                          ) : (
                            editingBusAgent ? 'Update Bus Agent' : 'Create Bus Agent'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Notifications Management Section */}
          {selectedSection === 'notifications' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Notifications Management</h1>
                <div className="flex space-x-4 mb-4">
                  <button 
                    onClick={handleAddNotification} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 font-semibold"
                  >
                    <FiBell className="animate-bounce-slow" /> Add Notification
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2">
                    <FiBarChart2 /> Export
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full bg-white rounded-xl shadow-lg border border-gray-200">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">#</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">User</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Message</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Date</th>
                        <th className="py-3 px-4 border-b font-semibold text-gray-700 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification, idx) => (
                        <tr key={notification.id} className="transition-all duration-200 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.01] cursor-pointer group">
                          <td className="py-2 px-4 border-b text-gray-700">{idx + 1}</td>
                          <td className="py-2 px-4 border-b text-gray-600 font-medium group-hover:text-blue-700">{notification.user}</td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{notification.message}</td>
                          <td className="py-2 px-4 border-b text-gray-600 group-hover:text-blue-700">{notification.date}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex gap-2">
                              <button
                                title="Edit"
                                onClick={() => {
                                  setNotificationForm({
                                    user: notification.user,
                                    message: notification.message
                                  });
                                  setShowNotificationModal(true);
                                }}
                                className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-transform duration-200 hover:scale-110"
                              >
                                <FiEdit />
                              </button>
                              <button
                                title="Delete"
                                onClick={() => {
                                  setNotifications(notifications.filter(n => n.id !== notification.id));
                                }}
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
              
              {/* Notification Modal */}
              {showNotificationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                    <h2 className="text-xl font-bold mb-4 text-blue-700">Add Notification</h2>
                    <form onSubmit={handleNotificationFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User/Target *
                        </label>
                        <input 
                          name="user" 
                          value={notificationForm.user} 
                          onChange={handleNotificationFormChange} 
                          required 
                          placeholder="Enter user name or 'All Users'" 
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea 
                          name="message" 
                          value={notificationForm.message} 
                          onChange={handleNotificationFormChange} 
                          required 
                          placeholder="Enter notification message" 
                          rows="4"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowNotificationModal(false);
                            setNotificationForm({ user: '', message: '' });
                          }} 
                          className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Send Notification
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Update Profile Section */}
          {selectedSection === 'updateProfile' && (
            <div className="flex animate-fade-in">
              <div className="flex flex-col w-full max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Update Profile</h1>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow mr-6">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{admin.name}</h2>
                      <p className="text-gray-600">{admin.email || 'admin@example.com'}</p>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Admin</span>
                    </div>
                  </div>
                  
                  {!profileFetched && (
                    <div className="mb-6">
                      <button
                        onClick={handleFetchProfile}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FiUser /> Load Profile Information
                      </button>
                    </div>
                  )}
                  
                  {profileFetched && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={profileInfo.name}
                            onChange={(e) => setProfileInfo({...profileInfo, name: e.target.value})}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={profileInfo.email}
                            onChange={(e) => setProfileInfo({...profileInfo, email: e.target.value})}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={profileInfo.role}
                          disabled
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password (optional)
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        />
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileFetched(false);
                              setProfileInfo({ name: '', email: '', role: '' });
                            }}
                            className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <FiEdit /> Update Profile
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Account Type:</span>
                        <span className="ml-2 font-medium">Administrator</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Login:</span>
                        <span className="ml-2 font-medium">Today</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Account Status:</span>
                        <span className="ml-2 font-medium text-green-600">Active</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Permissions:</span>
                        <span className="ml-2 font-medium">Full Access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
