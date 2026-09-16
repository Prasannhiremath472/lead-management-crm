const { updateBySettingKey: updateBySettingKeyMiddleware } = require('@/middlewares/settings');
const { withMongoIdShim } = require('@/db/queryBuilder');

const updateBySettingKey = async (req, res) => {
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingKey provided ',
    });
  }
  const { settingValue } = req.body;

  if (!settingValue) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingValue provided ',
    });
  }

  const result = await updateBySettingKeyMiddleware({ settingKey, settingValue });

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    });
  } else {
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(result),
      message: 'we update this document by this settingKey: ' + settingKey,
    });
  }
};

module.exports = updateBySettingKey;
