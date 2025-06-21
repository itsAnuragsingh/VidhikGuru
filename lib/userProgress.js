import { connectToDatabase } from "./mongodb"

export async function getUserProgress(userId) {
  try {
    const { client, db } = await connectToDatabase()
    const collection = db.collection('userProgress')
    
    let userProgress = await collection.findOne({ userId })
    
    if (!userProgress) {
      // Create new user progress
      const newProgress = {
        userId,
        readArticles: [],
        totalTimeSpent: 0,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await collection.insertOne(newProgress)
      userProgress = newProgress
    }
    
    // Calculate progress percentage
    const totalArticles = await getTotalArticlesCount(db)
    const progressPercentage = Math.round((userProgress.readArticles.length / totalArticles) * 100)
    
    return {
      totalArticlesRead: userProgress.readArticles.length,
      totalTimeSpent: userProgress.totalTimeSpent,
      progressPercentage,
      readArticles: userProgress.readArticles,
      lastActiveAt: userProgress.lastActiveAt,
    }
  } catch (error) {
    console.error('Error getting user progress:', error)
    throw error
  }
}

export async function markArticleAsRead(userId, partNo, articleNo, timeSpent = 0) {
  try {
   const { db } = await connectToDatabase()
    const collection = db.collection('userProgress')
    
    let userProgress = await collection.findOne({ userId })
    
    if (!userProgress) {
      userProgress = {
        userId,
        readArticles: [],
        totalTimeSpent: 0,
        lastActiveAt: new Date(),
        createdAt: new Date()
      }
    }
    
    // Check if article already read
    const existingArticle = userProgress.readArticles.find(
      article => article.partNo === partNo && article.articleNo === articleNo
    )
    
    if (!existingArticle) {
      userProgress.readArticles.push({
        partNo,
        articleNo,
        readAt: new Date(),
        timeSpent
      })
    } else {
      // Update existing
      existingArticle.timeSpent += timeSpent
      existingArticle.readAt = new Date()
    }
    
    userProgress.totalTimeSpent += timeSpent
    userProgress.lastActiveAt = new Date()
    userProgress.updatedAt = new Date()
    
    // Upsert the document
    await collection.replaceOne(
      { userId }, 
      userProgress, 
      { upsert: true }
    )
    
    const totalArticles = await getTotalArticlesCount(db)
    const progressPercentage = Math.round((userProgress.readArticles.length / totalArticles) * 100)
    
    return {
      totalArticlesRead: userProgress.readArticles.length,
      progressPercentage,
      message: 'Article marked as read'
    }
  } catch (error) {
    console.error('Error marking article as read:', error)
    throw error
  }
}

async function getTotalArticlesCount(db) {
  try {
    const pipeline = [
      { $unwind: '$Articles' },
      { $count: 'total' }
    ]
    
    const result = await db.collection('constitution_datas').aggregate(pipeline).toArray()
    return result[0]?.total || 395 // fallback
  } catch (error) {
    console.error('Error getting total articles:', error)
    return 395 // fallback
  }
}