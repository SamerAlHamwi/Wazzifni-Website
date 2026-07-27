const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger Middleware for Admins & Instructors.
 * Logs mutating actions (POST, PUT, PATCH, DELETE) to the database for security traceability.
 */
const auditLogger = (resourceName) => {
    return async (req, res, next) => {
        // Only log mutating requests or explicitly asked ones
        const methodsToLog = ['POST', 'PUT', 'PATCH', 'DELETE'];

        if (methodsToLog.includes(req.method) && req.user) {

            // Map HTTP method to Action
            let actionType = 'OTHER';
            if (req.method === 'POST') actionType = 'CREATE';
            if (req.method === 'PUT' || req.method === 'PATCH') actionType = 'UPDATE';
            if (req.method === 'DELETE') actionType = 'DELETE';

            // Special cases (like login) handled manually or detected
            if (req.path.includes('/login')) actionType = 'LOGIN';
            if (req.path.includes('/export')) actionType = 'EXPORT';

            try {
                // Determine resource ID if available in params
                const resourceId = req.params.id || null;

                // Scrub passwords from details before logging
                let safeBody = { ...req.body };
                if (safeBody.password) safeBody.password = '***';
                if (safeBody.passwordConfirm) safeBody.passwordConfirm = '***';
                if (safeBody.passwordCurrent) safeBody.passwordCurrent = '***';

                // Save asynchronously so it doesn't block the request response loop
                AuditLog.create({
                    adminId: req.user._id,
                    adminEmail: req.user.email,
                    adminRole: req.user.role,
                    action: actionType,
                    resource: resourceName,
                    resourceId: resourceId,
                    details: safeBody,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent')
                }).catch(err => console.error('Error writing audit log:', err));
            } catch (err) {
                console.error('Audit Logger Execution Error:', err);
            }
        }

        next();
    };
};

module.exports = auditLogger;