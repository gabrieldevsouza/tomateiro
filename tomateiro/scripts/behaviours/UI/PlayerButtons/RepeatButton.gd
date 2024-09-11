extends Node

@export var cycle_time : CycleTimeController

@export var repeat_button : BaseButton

func _ready() -> void:
	repeat_button.pressed.connect(on_repeat_pressed)

func on_repeat_pressed() -> void:
	cycle_time.repeat()
