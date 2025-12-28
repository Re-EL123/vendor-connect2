// js/post-card.js

async function createPostCard(doc, vendorId) {
  const post = doc.data();

  // Fetch vendor name
  let vendorName = "Unknown Vendor";
  try {
    const vendorDoc = await firebase.firestore().collection("vendors").doc(vendorId).get();
    if (vendorDoc.exists) {
      vendorName = vendorDoc.data().name || vendorName;
    }
  } catch (error) {
    console.error("Error fetching vendor:", error);
  }

  const card = document.createElement("div");
  card.className = "bg-white shadow rounded p-4";

  card.innerHTML = `
    <div class="flex items-center mb-2">
      <img src="${post.userProfileImage || 'assets/default-avatar.png'}" class="w-10 h-10 rounded-full mr-3" alt="User">
      <div>
        <p class="font-semibold">${vendorName}</p>
        <p class="text-xs text-gray-500">${new Date(post.timestamp?.toDate?.() || Date.now()).toLocaleString()}</p>
      </div>
    </div>
    <p class="mb-2">${post.caption || ''}</p>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="w-full rounded mb-2" alt="Post image">` : ''}
    <div class="flex justify-between items-center text-sm text-gray-600">
      <button class="like-btn" data-id="${doc.id}">❤️ ${post.likes || 0}</button>
      <button class="view-btn" data-id="${doc.id}">👁️ ${post.views || 0}</button>
      <a href="post.html?id=${doc.id}" class="text-blue-500">💬 Comments</a>
    </div>
  `;

  return card;
}
