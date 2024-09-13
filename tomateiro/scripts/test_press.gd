extends Node

@export var label : Label

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


func _process(_delta: float) -> void:
	label.text = "is_mouse_button_pressed: " + str(Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT))
