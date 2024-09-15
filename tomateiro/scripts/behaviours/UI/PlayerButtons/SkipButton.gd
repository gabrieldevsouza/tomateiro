extends Node

@export var cycle_time : CycleTimeController

@export var skip_button : BaseButton

func _ready() -> void:
	skip_button.pressed.connect(on_skip_pressed)

func on_skip_pressed() -> void:
	cycle_time.finish()
