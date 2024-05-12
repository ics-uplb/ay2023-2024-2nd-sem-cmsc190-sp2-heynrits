const UserPreference = require("../models/user-preference");

exports.getPreferences = async (req, res) => {
  const { organization } = req.query;

  try {
    let pref = await UserPreference.findOne({
      user: req.user._id,
      organization,
    });

    if (!pref) {
      pref = new UserPreference({
        user: req.user._id,
        organization,
      });
      await pref.save();
    }

    return res.status(200).json(pref);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.updatePreference = async (req, res) => {
  const { organization, batch } = req.body;

  try {
    let pref = await UserPreference.findOne({
      user: req.user._id,
      organization,
    });

    if (!pref) {
      pref = new UserPreference({
        user: req.user._id,
        organization,
      });
    } else {
      pref.lastSelectedBatch = batch;
    }
    await pref.save();

    return res.status(200).json(pref);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
