export async function fetchRestaurantData(appId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/menu`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "X-App-Id": appId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch restaurant data.");
  }

  return res.json();
}

export async function fetchSections(menuId, appId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/menu/section/${menuId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "X-App-Id": appId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sections.");
  }

  return res.json();
}

export async function fetchSectionItems(sectionId, appId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/menu/items/${sectionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "X-App-Id": appId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch section items.");
  }

  return res.json();
}

