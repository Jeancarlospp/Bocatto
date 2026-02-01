import User from '../models/User.js';

/**
 * Get all clients with pagination, search and filters
 * GET /clients
 */
export const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '', // 'active', 'inactive', or '' for all
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query - only clients (not admins)
    const query = { role: 'client' };

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const [clients, totalCount] = await Promise.all([
      User.find(query)
        .select('-password -googleId')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los clientes',
      error: error.message
    });
  }
};

/**
 * Update client status (activate/deactivate)
 * PUT /clients/:id/status
 */
export const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo isActive debe ser un booleano'
      });
    }

    // Find client by incremental id or MongoDB _id
    let client;
    if (!isNaN(id)) {
      client = await User.findOne({ id: parseInt(id), role: 'client' });
    } else {
      client = await User.findOne({ _id: id, role: 'client' });
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Update status
    client.isActive = isActive;
    await client.save();

    res.json({
      success: true,
      message: `Cliente ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        id: client.id,
        _id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        isActive: client.isActive
      }
    });

  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del cliente',
      error: error.message
    });
  }
};

/**
 * Get client details by ID
 * GET /clients/:id
 */
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find client by incremental id or MongoDB _id
    let client;
    if (!isNaN(id)) {
      client = await User.findOne({ id: parseInt(id), role: 'client' }).select('-password -googleId');
    } else {
      client = await User.findOne({ _id: id, role: 'client' }).select('-password -googleId');
    }

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el cliente',
      error: error.message
    });
  }
};
