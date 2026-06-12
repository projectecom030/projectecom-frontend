"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const AdminUsermanagement = () => {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])



  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users")
      setUsers(res.data.data || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      search.trim() === "" ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search)

    const roleMatch =
      roleFilter === "all" ||
      user.role?.toString().trim().toLowerCase().includes(roleFilter.toLowerCase())

    return searchMatch && roleMatch
  })

  const roleLabels = {
    customer: "Customer",
    owner: "Owner",
    dealer: "Dealer",
  }

  const phonesByRole = filteredUsers.reduce(
    (acc, user) => {
      const roleKey = user.role || "customer"
      if (!acc[roleKey]) acc[roleKey] = []
      if (user.phone) acc[roleKey].push(user.phone)
      return acc
    },
    { customer: [], owner: [], dealer: [] },
  )

  const copyPhones = async (role) => {
    const list = phonesByRole[role] || []
    if (!list.length) return
    const text = list.join(", ")
    try {
      await navigator.clipboard.writeText(text)
      alert(`${roleLabels[role]} phone numbers copied`)
    } catch (error) {
      alert("Failed to copy numbers")
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?")
    if (!confirmDelete) return

    try {
      await api.delete(`/admin/users/${id}`)
      fetchUsers()
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Failed to delete user")
    }
  }

  const downloadCSV = () => {
    const headers = ["S.No", "Name", "Phone", "Email", "Role", "Properties Count"]

    const rows = filteredUsers.map((user, index) => [
      index + 1,
      user.full_name,
      user.phone,
      user.email,
      user.role,
      user.property_count || 0,
    ])

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "users_data.csv")
    document.body.appendChild(link)
    link.click()
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage system users</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white p-4 rounded-xl border mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          className="border rounded-lg px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="dealer">Dealer</option>
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Phone Numbers by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["customer", "owner", "dealer"].map((role) => (
            <div key={role} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{roleLabels[role]}</span>
                <button
                  onClick={() => copyPhones(role)}
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 break-words">
                {phonesByRole[role]?.length ? phonesByRole[role].join(", ") : "No phones"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3">S.No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Properties Count</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{user.full_name}</td>
                    <td className="p-3">{user.phone}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3 text-center">
                      {user.property_count || 0}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsermanagement
