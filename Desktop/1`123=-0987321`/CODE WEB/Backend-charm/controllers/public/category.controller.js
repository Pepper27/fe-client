// const Category = require("../../models/category.model");

// // Public categories for homepage/menu.
// // Minimal contract: list categories (default: root-only).
// module.exports.getCategories = async (req, res) => {
//   try {
//     const onlyRoot = String(req.query.root || "1").trim() !== "0";

//     const find = { deleted: false };
//     if (onlyRoot) {
//       // `parent` is stored as string in this codebase; root is commonly empty.
//       find.$or = [{ parent: "" }, { parent: null }, { parent: { $exists: false } }];
//     }

//     const categories = await Category.find(find)
//       .select("name slug avatar parent position")
//       .sort({ position: 1, createdAt: -1 })
//       .lean();

//     return res.status(200).json({ data: categories || [] });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
