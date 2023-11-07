const PermissionsModel = (sequelize, Sequelize) => {
    const { INTEGER, STRING, FLOAT, BOOLEAN, DATE } = Sequelize
    const Permissions = sequelize.define('Permissions', {
        Role: { type: STRING, allowNull: false },
        ControllerAddress: { type: STRING, allowNull: false }
    })
    return Permissions
}

module.exports = PermissionsModel