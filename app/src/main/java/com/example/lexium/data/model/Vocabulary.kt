package com.example.lexium.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "vocabulary")
data class Vocabulary(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,

    val word: String,
    val meaning: String,

    val difficulty: String = "Medium",

    val timesSeen: Int = 0,
    val timesCorrect: Int = 0,

    val lastReviewed: Long = System.currentTimeMillis()
)