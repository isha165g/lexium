package com.example.lexium.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.lexium.data.dao.UserDao
import com.example.lexium.data.dao.VocabularyDao
import com.example.lexium.data.model.User
import com.example.lexium.data.model.Vocabulary

@Database(entities = [User::class, Vocabulary::class], version = 3)
abstract class AppDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao
    abstract fun vocabularyDao(): VocabularyDao
}